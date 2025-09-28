'use client';

import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export default function ScannerButton({ onImageCapture, disabled = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const takePhoto = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Solicitar permisos y tomar foto con alta calidad
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90, // Calidad alta como solicitaste
        allowEditing: false,
        saveToGallery: false,
        presentationStyle: 'fullscreen'
      });

      if (photo.webPath) {
        // Generar nombre único con timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `scan_${timestamp}.jpeg`;

        // Convertir la imagen a base64 para guardado
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        const base64Data = await convertBlobToBase64(blob);

        // Guardar la imagen en el sistema de archivos
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });

        // Crear objeto con información de la imagen
        const imageData = {
          id: Date.now().toString(),
          fileName: fileName,
          webPath: photo.webPath,
          savedPath: savedFile.uri,
          timestamp: new Date().toISOString()
        };

        // Notificar al componente padre
        onImageCapture(imageData);
      }
    } catch (err) {
      console.error('Error al tomar foto:', err);
      setError('Error al acceder a la cámara. Verifica los permisos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función auxiliar para convertir blob a base64
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result.split(',')[1]); // Remover el prefijo data:image/...
      };
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={takePhoto}
        disabled={disabled || isLoading}
        className={`
          px-8 py-4 rounded-full font-semibold text-white text-lg
          transition-all duration-300 transform hover:scale-105
          ${disabled || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 active:scale-95 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Procesando...</span>
          </div>
        ) : (
          '📷 Escanear Documento'
        )}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}