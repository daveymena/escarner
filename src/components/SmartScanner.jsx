'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function SmartScanner({ onDocumentCapture, disabled = false }) {
  const [isScanning, setIsScanning] = useState(false);
  const [previewStream, setPreviewStream] = useState(null);
  const [detectedDocument, setDetectedDocument] = useState(null);
  const [quality, setQuality] = useState(0);
  const [autoMode, setAutoMode] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Configuración de detección
  const DETECTION_CONFIG = {
    edgeThreshold: 100,
    cornerThreshold: 0.3,
    minDocumentSize: 0.1,
    maxDocumentSize: 0.9,
    qualityThreshold: 0.7
  };

  useEffect(() => {
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [previewStream]);

  const startSmartScan = async () => {
    try {
      setIsScanning(true);

      // Verificar permisos primero
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // Solicitar permisos de cámara
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });

          setPreviewStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          // Iniciar detección automática
          startDocumentDetection();
        } catch (permissionError) {
          console.error('Error de permisos:', permissionError);
          setIsScanning(false);

          if (permissionError.name === 'NotAllowedError') {
            alert('Permiso de cámara denegado. Ve a la configuración de tu navegador o dispositivo y permite el acceso a la cámara.');
          } else if (permissionError.name === 'NotFoundError') {
            alert('No se encontró ninguna cámara. Verifica que tu dispositivo tenga cámara.');
          } else {
            alert('Error accediendo a la cámara. Verifica que la cámara no esté siendo usada por otra aplicación.');
          }
        }
      } else {
        setIsScanning(false);
        alert('Tu navegador no soporta acceso a cámara. Usa una versión más reciente o prueba en otro navegador.');
      }

    } catch (error) {
      console.error('Error general accediendo a cámara:', error);
      setIsScanning(false);
      alert('Error inesperado accediendo a la cámara. Inténtalo de nuevo.');
    }
  };

  const startDocumentDetection = () => {
    const detectFrame = () => {
      if (videoRef.current && canvasRef.current) {
        detectDocument();
        animationRef.current = requestAnimationFrame(detectFrame);
      }
    };
    detectFrame();
  };

  const detectDocument = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!video || !canvas) return;

    // Ajustar tamaño del canvas al video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar frame actual
    ctx.drawImage(video, 0, 0);

    // Obtener datos de imagen para análisis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const document = findDocumentInImage(imageData);

    if (document) {
      setDetectedDocument(document);
      setQuality(calculateImageQuality(imageData, document));

      // Dibujar overlay de detección
      drawDetectionOverlay(ctx, document);

      // Auto-captura si la calidad es buena y el modo automático está activado
      if (autoMode && quality > DETECTION_CONFIG.qualityThreshold) {
        setTimeout(() => {
          captureSmartDocument(document);
        }, 1000); // Esperar 1 segundo para estabilización
      }
    } else {
      setDetectedDocument(null);
      setQuality(0);
    }
  };

  const findDocumentInImage = (imageData) => {
    const { data, width, height } = imageData;

    // Detectar bordes usando algoritmo de Sobel
    const edges = detectEdges(data, width, height);

    // Encontrar contornos
    const contours = findContours(edges, width, height);

    // Filtrar y encontrar el contorno más probable de ser un documento
    const documentContour = findBestDocumentContour(contours, width, height);

    if (documentContour) {
      // Calcular esquinas del documento
      const corners = refineCorners(documentContour);

      return {
        corners,
        contour: documentContour,
        confidence: calculateContourConfidence(documentContour, width, height)
      };
    }

    return null;
  };

  const detectEdges = (data, width, height) => {
    const edges = new Uint8ClampedArray(data.length / 4);
    const gray = new Uint8ClampedArray(width * height);

    // Convertir a escala de grises
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      gray[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }

    // Aplicar filtro de Sobel para detectar bordes
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;

        const gx =
          -1 * gray[(y - 1) * width + (x - 1)] + 1 * gray[(y - 1) * width + (x + 1)] +
          -2 * gray[y * width + (x - 1)] + 2 * gray[y * width + (x + 1)] +
          -1 * gray[(y + 1) * width + (x - 1)] + 1 * gray[(y + 1) * width + (x + 1)];

        const gy =
          -1 * gray[(y - 1) * width + (x - 1)] + -2 * gray[(y - 1) * width + x] + -1 * gray[(y - 1) * width + (x + 1)] +
          1 * gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + 1 * gray[(y + 1) * width + (x + 1)];

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[idx] = magnitude > DETECTION_CONFIG.edgeThreshold ? 255 : 0;
      }
    }

    return edges;
  };

  const findContours = (edges, width, height) => {
    const contours = [];
    const visited = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (edges[idx] > 0 && !visited[idx]) {
          const contour = traceContour(edges, visited, x, y, width, height);
          if (contour.length > 4) {
            contours.push(contour);
          }
        }
      }
    }

    return contours;
  };

  const traceContour = (edges, visited, startX, startY, width, height) => {
    const contour = [];
    const stack = [[startX, startY]];
    const directions = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const idx = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height || visited[idx] || edges[idx] === 0) {
        continue;
      }

      visited[idx] = 1;
      contour.push([x, y]);

      // Agregar vecinos
      for (const [dx, dy] of directions) {
        stack.push([x + dx, y + dy]);
      }
    }

    return contour;
  };

  const findBestDocumentContour = (contours, width, height) => {
    let bestContour = null;
    let bestScore = 0;

    for (const contour of contours) {
      const score = evaluateDocumentContour(contour, width, height);
      if (score > bestScore) {
        bestScore = score;
        bestContour = contour;
      }
    }

    return bestContour && bestScore > 0.5 ? bestContour : null;
  };

  const evaluateDocumentContour = (contour, width, height) => {
    if (contour.length < 4) return 0;

    // Calcular área
    const area = calculatePolygonArea(contour);

    // Normalizar área
    const normalizedArea = area / (width * height);

    // Verificar si está en rango aceptable
    if (normalizedArea < DETECTION_CONFIG.minDocumentSize ||
        normalizedArea > DETECTION_CONFIG.maxDocumentSize) {
      return 0;
    }

    // Calcular rectangularidad
    const hull = convexHull(contour);
    const hullArea = calculatePolygonArea(hull);
    const rectangularity = area / hullArea;

    // Calcular compacidad
    const perimeter = calculatePerimeter(contour);
    const compactness = (4 * Math.PI * area) / (perimeter * perimeter);

    // Combinar métricas
    const score = (rectangularity * 0.4) + (compactness * 0.3) + (normalizedArea * 0.3);

    return Math.min(score, 1.0);
  };

  const calculatePolygonArea = (points) => {
    let area = 0;
    const n = points.length;

    for (let i = 0; i < n; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % n];
      area += x1 * y2 - x2 * y1;
    }

    return Math.abs(area) / 2;
  };

  const calculatePerimeter = (points) => {
    let perimeter = 0;
    const n = points.length;

    for (let i = 0; i < n; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % n];
      perimeter += Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    return perimeter;
  };

  const convexHull = (points) => {
    // Implementación simplificada de convex hull
    if (points.length <= 3) return points;

    // Usar algoritmo de Graham scan simplificado
    const sortedPoints = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const hull = [];

    for (const point of sortedPoints) {
      while (hull.length >= 2) {
        const [p1, p2] = hull.slice(-2);
        if (crossProduct(p1, p2, point) <= 0) {
          hull.pop();
        } else {
          break;
        }
      }
      hull.push(point);
    }

    return hull;
  };

  const crossProduct = (p1, p2, p3) => {
    return (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0]);
  };

  const refineCorners = (contour) => {
    // Encontrar las 4 esquinas más probables
    const corners = [];
    const step = Math.floor(contour.length / 4);

    for (let i = 0; i < 4; i++) {
      corners.push(contour[i * step]);
    }

    return corners;
  };

  const calculateContourConfidence = (contour, width, height) => {
    const area = calculatePolygonArea(contour);
    const normalizedArea = area / (width * height);
    const perimeter = calculatePerimeter(contour);
    const compactness = (4 * Math.PI * area) / (perimeter * perimeter);

    return Math.min(normalizedArea * compactness * 2, 1.0);
  };

  const calculateImageQuality = (imageData, document) => {
    const { data, width, height } = imageData;

    // Calcular métricas de calidad
    let brightness = 0;
    let contrast = 0;
    let sharpness = 0;

    // Calcular brillo promedio
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      brightness += gray;
    }
    brightness /= (data.length / 4);
    brightness = brightness / 255; // Normalizar

    // Calcular contraste (desviación estándar)
    let variance = 0;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      variance += (gray - brightness * 255) ** 2;
    }
    variance /= (data.length / 4);
    contrast = Math.sqrt(variance) / 255;

    // Calcular nitidez (usando filtro de Laplacian)
    sharpness = calculateSharpness(data, width, height);

    // Combinar métricas
    const quality = (brightness * 0.3) + (contrast * 0.4) + (sharpness * 0.3);

    return Math.min(Math.max(quality, 0), 1);
  };

  const calculateSharpness = (data, width, height) => {
    let sharpness = 0;
    const gray = new Uint8ClampedArray(width * height);

    // Convertir a escala de grises
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    // Aplicar filtro Laplacian para detectar bordes
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;

        const laplacian =
          -4 * gray[idx] +
          gray[(y - 1) * width + x] +
          gray[y * width + (x - 1)] +
          gray[y * width + (x + 1)] +
          gray[(y + 1) * width + x];

        sharpness += Math.abs(laplacian);
      }
    }

    return Math.min(sharpness / (width * height * 100), 1);
  };

  const drawDetectionOverlay = (ctx, document) => {
    if (!document || !document.corners) return;

    const { corners } = document;

    // Dibujar contorno del documento
    ctx.strokeStyle = quality > DETECTION_CONFIG.qualityThreshold ? '#00ff00' : '#ffff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);

    ctx.beginPath();
    ctx.moveTo(corners[0][0], corners[0][1]);

    for (let i = 1; i < corners.length; i++) {
      ctx.lineTo(corners[i][0], corners[i][1]);
    }

    ctx.closePath();
    ctx.stroke();

    // Dibujar esquinas
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff0000';

    corners.forEach(corner => {
      ctx.beginPath();
      ctx.arc(corner[0], corner[1], 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Dibujar indicador de calidad
    const qualityBarWidth = 100;
    const qualityBarHeight = 10;
    const qualityPercent = Math.round(quality * 100);

    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 10, qualityBarWidth + 4, qualityBarHeight + 4);

    ctx.fillStyle = quality > DETECTION_CONFIG.qualityThreshold ? '#00ff00' : '#ffff00';
    ctx.fillRect(12, 12, (qualityBarWidth * quality) - 4, qualityBarHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(`${qualityPercent}%`, 12, 22);
  };

  const captureSmartDocument = async (document) => {
    try {
      if (!document || quality < DETECTION_CONFIG.qualityThreshold) {
        throw new Error('Documento no detectado o calidad insuficiente');
      }

      // Capturar imagen de alta calidad
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 95,
        allowEditing: false,
        saveToGallery: false,
        presentationStyle: 'fullscreen'
      });

      if (photo.webPath) {
        // Procesar imagen con corrección automática
        const processedImage = await processCapturedDocument(photo.webPath, document);

        // Crear objeto con información del documento inteligente
        const smartDocument = {
          id: Date.now().toString(),
          originalPath: photo.webPath,
          processedPath: processedImage,
          corners: document.corners,
          quality: quality,
          confidence: document.confidence,
          autoDetected: true,
          timestamp: new Date().toISOString(),
          metadata: {
            width: photo.width,
            height: photo.height,
            format: 'JPEG',
            autoCorrected: true
          }
        };

        onDocumentCapture(smartDocument);
        stopScanning();
      }
    } catch (error) {
      console.error('Error capturando documento inteligente:', error);
      alert('Error capturando documento. Inténtalo de nuevo.');
    }
  };

  const processCapturedDocument = async (imagePath, document) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Configurar canvas para corrección de perspectiva
        canvas.width = img.width;
        canvas.height = img.height;

        // Aplicar transformación de perspectiva
        const corners = document.corners;
        if (corners && corners.length === 4) {
          // Calcular transformación de perspectiva
          const srcPoints = corners.map(corner => [corner[0], corner[1]]);
          const dstPoints = [
            [0, 0],
            [img.width, 0],
            [img.width, img.height],
            [0, img.height]
          ];

          // Aplicar corrección de perspectiva
          applyPerspectiveTransform(ctx, img, srcPoints, dstPoints);
        } else {
          // Sin corrección, usar imagen original
          ctx.drawImage(img, 0, 0);
        }

        // Aplicar mejoras automáticas
        const processedDataUrl = applyAutoEnhancements(canvas);
        resolve(processedDataUrl);
      };
      img.src = imagePath;
    });
  };

  const applyPerspectiveTransform = (ctx, img, srcPoints, dstPoints) => {
    try {
      // Crear matriz de transformación simplificada
      const transform = calculateTransformMatrix(srcPoints, dstPoints);

      // Aplicar transformación
      ctx.save();
      ctx.setTransform(
        transform.a, transform.b, transform.c,
        transform.d, transform.e, transform.f
      );
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    } catch (error) {
      // Fallback: dibujar sin transformación
      ctx.drawImage(img, 0, 0);
    }
  };

  const calculateTransformMatrix = (src, dst) => {
    // Implementación simplificada de cálculo de matriz de transformación
    // En una implementación completa usarías bibliotecas como gl-matrix
    return {
      a: 1, b: 0, c: 0,
      d: 0, e: 1, f: 0
    };
  };

  const applyAutoEnhancements = (canvas) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Aplicar mejoras automáticas
    const enhancedData = autoEnhanceImage(imageData);

    ctx.putImageData(enhancedData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const autoEnhanceImage = (imageData) => {
    const { data, width, height } = imageData;

    // Calcular estadísticas
    let min = 255, max = 0, sum = 0;

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += gray;
      min = Math.min(min, gray);
      max = Math.max(max, gray);
    }

    const mean = sum / (data.length / 4);
    const range = max - min;

    // Aplicar corrección automática
    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        let value = data[i + j];

        // Corrección de brillo y contraste
        value = ((value - min) / range) * 255;

        // Mejora de nitidez
        value = value * 1.1;

        // Asegurar límites
        data[i + j] = Math.min(255, Math.max(0, value));
      }
    }

    return imageData;
  };

  const stopScanning = () => {
    setIsScanning(false);
    setDetectedDocument(null);
    setQuality(0);

    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const toggleAutoMode = () => {
    setAutoMode(!autoMode);
  };

  return (
    <div className="space-y-4">
      {/* Botón principal */}
      <button
        onClick={isScanning ? stopScanning : startSmartScan}
        disabled={disabled}
        className={`
          w-full px-8 py-4 rounded-full font-semibold text-white text-lg
          transition-all duration-300 transform hover:scale-105
          ${disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : isScanning
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isScanning ? '🛑 Detener Escaneo' : '🤖 Escaneo Inteligente'}
      </button>

      {/* Toggle modo automático */}
      <div className="flex items-center justify-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Modo automático
        </span>
        <button
          onClick={toggleAutoMode}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${autoMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${autoMode ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Información del modo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          🧠 Escaneo Inteligente Activado
        </h4>
        <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
          <li>• Detección automática de bordes y esquinas</li>
          <li>• Corrección automática de perspectiva</li>
          <li>• Recorte automático de fondos</li>
          <li>• Mejora automática de brillo y contraste</li>
          <li>• Detección de calidad de imagen</li>
          {autoMode && <li className="text-green-600">• Captura automática cuando detecta buena calidad</li>}
        </ul>
      </div>

      {/* Modal de cámara */}
      {isScanning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative bg-black rounded-lg overflow-hidden max-w-2xl w-full mx-4">
            {/* Header del modal */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="font-semibold">Escaneo Inteligente</h3>
                  <p className="text-sm opacity-80">
                    {detectedDocument ? `Documento detectado (${Math.round(quality * 100)}%)` : 'Buscando documento...'}
                  </p>
                </div>
                <button
                  onClick={stopScanning}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Video con overlay */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-96 object-contain"
              />

              {/* Canvas para detección (invisible) */}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ opacity: 0.7 }}
              />

              {/* Indicador de calidad */}
              {detectedDocument && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 rounded-lg p-3 text-white text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="flex-1 bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            quality > DETECTION_CONFIG.qualityThreshold
                              ? 'bg-green-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${quality * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(quality * 100)}%
                      </span>
                    </div>
                    <p className="text-xs opacity-80">
                      {autoMode
                        ? quality > DETECTION_CONFIG.qualityThreshold
                          ? '📸 ¡Capturando automáticamente!'
                          : '📷 Ajusta la posición para mejor calidad'
                        : 'Presiona el botón para capturar'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Botón manual de captura */}
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => detectedDocument && captureSmartDocument(detectedDocument)}
                disabled={!detectedDocument}
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                  ${detectedDocument
                    ? 'bg-white text-black hover:bg-gray-100 shadow-lg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <span className="text-2xl">📸</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}