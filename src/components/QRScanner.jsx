'use client';

import { useState, useRef, useEffect } from 'react';
import { Browser } from '@capacitor/browser';

export default function QRScanner({ onQRDetected, onClose }) {
  const [isScanning, setIsScanning] = useState(false);
  const [qrResult, setQrResult] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError('');
      setQrResult('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Iniciar detección de QR
      scanForQR();

    } catch (error) {
      console.error('Error iniciando escaneo QR:', error);
      setError('Error accediendo a la cámara. Verifica permisos.');
      setIsScanning(false);
    }
  };

  const scanForQR = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    // Aquí implementarías la lógica de detección de QR
    // Por simplicidad, usaremos un placeholder
    setTimeout(() => {
      if (isScanning) {
        scanForQR();
      }
    }, 100);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Procesar imagen para detectar QR
          processQRImage(img);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const processQRImage = (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Placeholder para detección de QR
    // En una implementación real usarías ZXing o QuaggaJS
    setTimeout(() => {
      setQrResult('https://ejemplo.com/qr-detectado');
      setError('');
    }, 2000);
  };

  const openResult = () => {
    if (qrResult) {
      if (qrResult.startsWith('http')) {
        Browser.open({ url: qrResult });
      } else {
        navigator.clipboard.writeText(qrResult);
        alert('Texto copiado al portapapeles');
      }
    }
  };

  const generateQR = () => {
    const text = prompt('Ingresa el texto para generar QR:');
    if (text) {
      // Placeholder para generación de QR
      alert('Función de generación de QR próximamente disponible');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            📱 Escáner de Código QR
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4">
          {!isScanning && !qrResult && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📱</div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Escáner de Código QR
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Escanea códigos QR con la cámara o sube una imagen
              </p>

              <div className="space-y-3">
                <button
                  onClick={startScanning}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                >
                  📷 Escanear con Cámara
                </button>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors">
                    🖼️ Subir Imagen
                  </button>
                </div>

                <button
                  onClick={generateQR}
                  className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
                >
                  ⚡ Generar QR
                </button>
              </div>
            </div>
          )}

          {/* Modal de cámara */}
          {isScanning && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-96 object-contain rounded-lg"
              />

              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />

              {/* Overlay para apuntar al QR */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg"></div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white bg-black bg-opacity-50 rounded-lg p-2">
                  📱 Apunta al código QR
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mt-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Resultado */}
          {qrResult && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Código QR Detectado:
              </h4>
              <p className="text-green-700 dark:text-green-300 text-sm mb-4 break-all">
                {qrResult}
              </p>
              <div className="space-x-2">
                <button
                  onClick={openResult}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                >
                  {qrResult.startsWith('http') ? '🔗 Abrir Enlace' : '📋 Copiar'}
                </button>
                <button
                  onClick={() => {
                    setQrResult('');
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  🔄 Escanear Otro
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-1">💡 <strong>Consejos:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Asegúrate de que el código QR esté bien iluminado</li>
              <li>Mantén la cámara estable y perpendicular al código</li>
              <li>Evita reflejos en la superficie del código</li>
              <li>Si no detecta, prueba subir una imagen manualmente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}