'use client';

import { useState, useRef } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function TapScanner({ onDocumentCapture, disabled = false }) {
  const [currentMode, setCurrentMode] = useState('document');
  const [isScanning, setIsScanning] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [qrResult, setQrResult] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const scanModes = [
    {
      id: 'document',
      name: 'Documento',
      icon: '📄',
      description: 'Escanea documentos y conviértelos a PDF'
    },
    {
      id: 'id',
      name: 'ID/Cédula',
      icon: '🆔',
      description: 'Escanea documentos de identidad'
    },
    {
      id: 'qr',
      name: 'Código QR',
      icon: '📱',
      description: 'Escanea códigos QR y barras'
    },
    {
      id: 'book',
      name: 'Libro',
      icon: '📚',
      description: 'Escanea páginas de libros'
    },
    {
      id: 'whiteboard',
      name: 'Pizarra',
      icon: '📋',
      description: 'Escanea pizarras y carteleras'
    }
  ];

  const filters = [
    { id: 'original', name: 'Original', icon: '🖼️' },
    { id: 'enhanced', name: 'Mejorado', icon: '✨' },
    { id: 'grayscale', name: 'B/N', icon: '⚫' },
    { id: 'color', name: 'Color', icon: '🎨' }
  ];

  const startScan = async (mode) => {
    try {
      setIsScanning(true);
      setCurrentMode(mode);
      setOcrText('');
      setQrResult('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    } catch (error) {
      console.error('Error iniciando escaneo:', error);
      setIsScanning(false);
      alert('Error accediendo a la cámara. Verifica permisos.');
    }
  };

  const captureImage = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
        allowEditing: false,
        saveToGallery: false
      });

      if (photo.webPath) {
        const result = await processImage(photo.webPath, currentMode);

        if (currentMode === 'qr') {
          setQrResult(result.text || 'Código QR detectado');
        } else if (currentMode === 'document' || currentMode === 'id' || currentMode === 'book' || currentMode === 'whiteboard') {
          setOcrText(result.text || 'Procesando texto...');
          onDocumentCapture({
            id: Date.now().toString(),
            path: photo.webPath,
            processedPath: result.processedPath,
            mode: currentMode,
            ocrText: result.text,
            metadata: {
              timestamp: new Date().toISOString(),
              mode: currentMode,
              hasText: !!result.text
            }
          });
        }

        setIsScanning(false);
      }
    } catch (error) {
      console.error('Error capturando imagen:', error);
      alert('Error capturando imagen. Inténtalo de nuevo.');
    }
  };

  const processImage = async (imagePath, mode) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        // Aplicar mejoras según el modo
        switch (mode) {
          case 'document':
            // Mejora automática para documentos
            ctx.filter = 'contrast(1.2) brightness(1.1)';
            break;
          case 'id':
            // Optimización para IDs
            ctx.filter = 'contrast(1.3) brightness(1.05) saturate(1.1)';
            break;
          case 'whiteboard':
            // Mejora para pizarras
            ctx.filter = 'contrast(1.4) brightness(0.9) saturate(1.2)';
            break;
          default:
            ctx.filter = 'none';
        }

        ctx.drawImage(img, 0, 0);

        const processedPath = canvas.toDataURL('image/jpeg', 0.9);

        // Extraer texto con OCR
        let extractedText = '';
        try {
          // Usar Tesseract.js para OCR
          const Tesseract = (await import('tesseract.js')).default;
          const { data } = await Tesseract.recognize(img, 'spa+eng');
          extractedText = data.text;
        } catch (error) {
          console.error('Error en OCR:', error);
        }

        resolve({
          processedPath,
          text: extractedText
        });
      };
      img.src = imagePath;
    });
  };


  return (
    <div className="space-y-8">
      {/* Header con título profesional */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📱 TapScanner Pro
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Escáner profesional con IA integrada
        </p>
      </div>

      {/* Selector de modos de escaneo - Diseño mejorado */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {scanModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setCurrentMode(mode.id)}
            className={`
              group relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center space-y-3
              hover:scale-105 hover:shadow-lg
              ${currentMode === mode.id
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }
            `}
          >
            {/* Icono con efecto glow */}
            <div className={`
              text-3xl transition-all duration-300
              ${currentMode === mode.id
                ? 'scale-110 filter drop-shadow-lg'
                : 'group-hover:scale-105'
              }
            `}>
              {mode.icon}
            </div>

            {/* Nombre del modo */}
            <span className={`
              text-sm font-semibold text-center transition-colors duration-300
              ${currentMode === mode.id
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }
            `}>
              {mode.name}
            </span>

            {/* Descripción flotante */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                {mode.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Información del modo actual - Diseño mejorado */}
      <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              {scanModes.find(m => m.id === currentMode)?.icon}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
              {scanModes.find(m => m.id === currentMode)?.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {scanModes.find(m => m.id === currentMode)?.description}
            </p>
          </div>
        </div>

        {/* Indicador de modo activo */}
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Botón de escanear - Diseño profesional */}
      <div className="relative">
        <button
          onClick={() => startScan(currentMode)}
          disabled={disabled || isScanning}
          className={`
            group relative w-full px-10 py-6 rounded-2xl font-bold text-white text-xl
            transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
            shadow-2xl hover:shadow-3xl overflow-hidden
            ${disabled || isScanning
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600'
            }
          `}
        >
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

          {isScanning ? (
            <div className="flex items-center justify-center space-x-4">
              <div className="relative">
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-6 h-6 border-3 border-transparent border-t-purple-300 rounded-full animate-spin"></div>
              </div>
              <span className="text-lg">Iniciando cámara...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-4">
              <div className="text-2xl animate-bounce">
                {scanModes.find(m => m.id === currentMode)?.icon}
              </div>
              <div className="text-center">
                <div className="text-lg">Escanear {scanModes.find(m => m.id === currentMode)?.name}</div>
                <div className="text-sm opacity-80">Toca para comenzar</div>
              </div>
            </div>
          )}
        </button>

        {/* Indicador de calidad */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg border">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">HD</span>
          </div>
        </div>
      </div>

      {/* Modal de escaneo - Diseño profesional */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2">
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden max-w-4xl w-full mx-2 shadow-2xl">
            {/* Header profesional */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                    {scanModes.find(m => m.id === currentMode)?.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {scanModes.find(m => m.id === currentMode)?.name}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {scanModes.find(m => m.id === currentMode)?.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScanning(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-xl transition-all duration-200 hover:scale-110"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Video preview - Diseño profesional */}
            <div className="relative bg-black rounded-2xl mx-4 mb-4 overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-[500px] object-contain"
              />

              {/* Canvas para overlay */}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />

              {/* Marco de escaneo animado */}
              <div className="absolute inset-0 border-2 border-white/50 rounded-2xl">
                <div className="absolute inset-0 border-2 border-white/20 animate-pulse"></div>
              </div>

              {/* Indicadores específicos por modo - Diseño mejorado */}
              {currentMode === 'qr' && (
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 backdrop-blur-sm rounded-2xl p-4 text-white text-center shadow-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-2xl">📱</span>
                      <span className="font-semibold">Código QR</span>
                    </div>
                    <p className="text-sm opacity-90">Apunta al código QR para escanear</p>
                  </div>
                </div>
              )}

              {currentMode === 'document' && (
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-gradient-to-r from-blue-500/90 to-green-500/90 backdrop-blur-sm rounded-2xl p-4 text-white text-center shadow-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-2xl">📄</span>
                      <span className="font-semibold">Documento</span>
                    </div>
                    <p className="text-sm opacity-90">Asegura que el documento esté bien iluminado</p>
                  </div>
                </div>
              )}

              {currentMode === 'id' && (
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-gradient-to-r from-green-500/90 to-teal-500/90 backdrop-blur-sm rounded-2xl p-4 text-white text-center shadow-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-2xl">🆔</span>
                      <span className="font-semibold">ID/Cédula</span>
                    </div>
                    <p className="text-sm opacity-90">Asegura que el ID esté completo en la imagen</p>
                  </div>
                </div>
              )}

              {currentMode === 'book' && (
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm rounded-2xl p-4 text-white text-center shadow-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-2xl">📚</span>
                      <span className="font-semibold">Libro</span>
                    </div>
                    <p className="text-sm opacity-90">Mantén la página plana y bien iluminada</p>
                  </div>
                </div>
              )}

              {currentMode === 'whiteboard' && (
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-gradient-to-r from-indigo-500/90 to-purple-500/90 backdrop-blur-sm rounded-2xl p-4 text-white text-center shadow-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-2xl">📋</span>
                      <span className="font-semibold">Pizarra</span>
                    </div>
                    <p className="text-sm opacity-90">Asegura que toda la pizarra esté visible</p>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de captura - Diseño profesional */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setIsScanning(false)}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Cancelar
                </button>
                <button
                  onClick={captureImage}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <span className="text-xl">📸</span>
                  <span>Capturar</span>
                </button>
              </div>

              {/* Indicador de calidad */}
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Calidad HD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultados de OCR - Diseño profesional */}
      {ocrText && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
              📝
            </div>
            <h4 className="font-bold text-green-800 dark:text-green-200 text-lg">
              Texto Detectado (OCR)
            </h4>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 mb-4 border border-green-100 dark:border-green-800">
            <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
              {ocrText}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => navigator.clipboard.writeText(ocrText)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>Copiar Texto</span>
            </button>
            <button
              onClick={() => setOcrText('')}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Resultados de QR - Diseño profesional */}
      {qrResult && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
              📱
            </div>
            <h4 className="font-bold text-purple-800 dark:text-purple-200 text-lg">
              Código QR Detectado
            </h4>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 mb-4 border border-purple-100 dark:border-purple-800">
            <p className="text-purple-700 dark:text-purple-300 text-sm break-all font-mono">
              {qrResult}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(qrResult);
                alert('Texto copiado al portapapeles');
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>Copiar Texto</span>
            </button>
            <button
              onClick={() => setQrResult('')}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Filtros rápidos - Diseño profesional */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-slate-600 rounded-xl flex items-center justify-center text-white">
            🎨
          </div>
          <h4 className="font-bold text-gray-800 dark:text-white text-lg">
            Filtros Profesionales
          </h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className="group p-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 text-center hover:scale-105"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  {filter.icon}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {filter.name}
                </span>
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 group-hover:w-full w-0"></div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          ✨ Los filtros se aplican automáticamente durante el procesamiento
        </p>
      </div>
    </div>
  );
}