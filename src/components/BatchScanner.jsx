'use client';

import { useState, useRef } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function BatchScanner({ onBatchComplete, disabled = false }) {
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchImages, setBatchImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureDelay, setCaptureDelay] = useState(2);
  const captureInterval = useRef(null);

  const startBatchScan = async () => {
    try {
      setIsBatchMode(true);
      setBatchImages([]);

      // Configurar cámara para modo continuo
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      // Iniciar captura automática por lotes
      startAutoCapture();

    } catch (error) {
      console.error('Error iniciando modo batch:', error);
      setIsBatchMode(false);
      alert('Error accediendo a la cámara para modo batch.');
    }
  };

  const startAutoCapture = () => {
    setIsCapturing(true);

    captureInterval.current = setInterval(async () => {
      try {
        const photo = await Camera.getPhoto({
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
          quality: 85,
          allowEditing: false,
          saveToGallery: false
        });

        if (photo.webPath) {
          const batchImage = {
            id: Date.now().toString() + Math.random(),
            path: photo.webPath,
            timestamp: new Date().toISOString(),
            batchIndex: batchImages.length + 1
          };

          setBatchImages(prev => [...prev, batchImage]);

          // Auto-procesar imagen
          await processBatchImage(batchImage);
        }
      } catch (error) {
        console.error('Error en captura automática:', error);
      }
    }, captureDelay * 1000);
  };

  const processBatchImage = async (image) => {
    // Procesamiento automático para modo batch
    const processedImage = {
      ...image,
      processed: true,
      autoEnhanced: true,
      metadata: {
        mode: 'batch',
        processingTime: Date.now()
      }
    };

    // Aquí podrías agregar procesamiento automático
    return processedImage;
  };

  const stopBatchScan = () => {
    setIsBatchMode(false);
    setIsCapturing(false);

    if (captureInterval.current) {
      clearInterval(captureInterval.current);
      captureInterval.current = null;
    }

    if (batchImages.length > 0) {
      onBatchComplete(batchImages);
    }

    setBatchImages([]);
  };

  const manualCapture = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 85,
        allowEditing: false,
        saveToGallery: false
      });

      if (photo.webPath) {
        const batchImage = {
          id: Date.now().toString() + Math.random(),
          path: photo.webPath,
          timestamp: new Date().toISOString(),
          batchIndex: batchImages.length + 1,
          manual: true
        };

        setBatchImages(prev => [...prev, batchImage]);
      }
    } catch (error) {
      console.error('Error en captura manual:', error);
    }
  };

  const removeBatchImage = (imageId) => {
    setBatchImages(prev => prev.filter(img => img.id !== imageId));
  };

  return (
    <div className="space-y-4">
      {/* Botón modo batch */}
      <button
        onClick={isBatchMode ? stopBatchScan : startBatchScan}
        disabled={disabled}
        className={`
          w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300
          ${disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : isBatchMode
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-purple-500 hover:bg-purple-600 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isBatchMode ? '🛑 Detener Batch' : '📚 Modo Batch'}
      </button>

      {/* Configuración de batch */}
      {isBatchMode && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
            ⚙️ Configuración de Batch
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delay de captura */}
            <div>
              <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                Intervalo de captura: {captureDelay}s
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={captureDelay}
                onChange={(e) => setCaptureDelay(Number(e.target.value))}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer dark:bg-purple-700"
              />
            </div>

            {/* Estado */}
            <div className="text-center">
              <p className="text-purple-600 dark:text-purple-400">
                📸 Capturando automáticamente
              </p>
              <p className="text-sm text-purple-500">
                {batchImages.length} imágenes capturadas
              </p>
            </div>
          </div>

          {/* Botón de captura manual */}
          <div className="mt-4 text-center">
            <button
              onClick={manualCapture}
              className="px-4 py-2 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors"
            >
              📷 Captura Manual
            </button>
          </div>
        </div>
      )}

      {/* Información del modo batch */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          📚 Modo de Escaneo por Lotes
        </h4>
        <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
          <li>• Captura automática de múltiples documentos</li>
          <li>• Configuración de intervalos de tiempo</li>
          <li>• Captura manual adicional disponible</li>
          <li>• Procesamiento automático de imágenes</li>
          <li>• Ideal para escanear múltiples páginas</li>
        </ul>
      </div>

      {/* Modal de batch activo */}
      {isBatchMode && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Modo Batch Activo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {batchImages.length} documentos capturados
                </p>
              </div>
              <button
                onClick={stopBatchScan}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {batchImages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📷</div>
                  <p>Esperando primera captura automática...</p>
                  <p className="text-sm">O usa "Captura Manual" para comenzar</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {batchImages.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.path}
                        alt={`Documento ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border-2 border-purple-200 dark:border-purple-600"
                      />
                      <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                      <button
                        onClick={() => removeBatchImage(image.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Intervalo: {captureDelay}s | Modo: {isCapturing ? 'Automático' : 'Pausado'}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={manualCapture}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    📷 Manual
                  </button>
                  <button
                    onClick={stopBatchScan}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    ✅ Completar ({batchImages.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}