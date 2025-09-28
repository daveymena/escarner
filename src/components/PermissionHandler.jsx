'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export default function PermissionHandler({ children }) {
  const [permissions, setPermissions] = useState({
    camera: false,
    filesystem: false,
    share: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (Capacitor.isNativePlatform()) {
        // En móvil, verificar permisos nativos
        await checkNativePermissions();
      } else {
        // En web, verificar permisos de navegador
        await checkWebPermissions();
      }
    } catch (err) {
      console.error('Error verificando permisos:', err);
      setError('Error verificando permisos de la aplicación');
    } finally {
      setIsLoading(false);
    }
  };

  const checkNativePermissions = async () => {
    try {
      // Verificar permisos de cámara
      const cameraPermission = await Camera.requestPermissions();
      setPermissions(prev => ({
        ...prev,
        camera: cameraPermission.camera === 'granted' || cameraPermission.photos === 'granted'
      }));
    } catch (error) {
      console.error('Error verificando permisos nativos:', error);
      setError('No se pudieron verificar los permisos de la aplicación');
    }
  };

  const checkWebPermissions = async () => {
    try {
      // Verificar permisos de cámara en navegador
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Detener stream inmediatamente
        setPermissions(prev => ({ ...prev, camera: true }));
      }
    } catch (error) {
      console.error('Error verificando permisos web:', error);
      setError('La aplicación necesita permisos de cámara para funcionar');
    }
  };

  const requestPermissions = async () => {
    try {
      setError(null);

      if (Capacitor.isNativePlatform()) {
        await requestNativePermissions();
      } else {
        await requestWebPermissions();
      }
    } catch (err) {
      console.error('Error solicitando permisos:', err);
      setError('Error al solicitar permisos. Verifica la configuración de tu dispositivo.');
    }
  };

  const requestNativePermissions = async () => {
    try {
      const cameraResult = await Camera.requestPermissions();
      const granted = cameraResult.camera === 'granted' || cameraResult.photos === 'granted';

      setPermissions(prev => ({ ...prev, camera: granted }));

      if (!granted) {
        setError('Permisos de cámara denegados. La aplicación no podrá escanear documentos.');
      }
    } catch (error) {
      setError('Error solicitando permisos de cámara');
    }
  };

  const requestWebPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, camera: true }));
    } catch (error) {
      setError('Permiso de cámara denegado. Haz clic en el ícono de cámara en la barra de direcciones y permite el acceso.');
    }
  };

  const openSettings = () => {
    if (Capacitor.isNativePlatform()) {
      // En Android/iOS, abrir configuración de la app
      if (Capacitor.getPlatform() === 'android') {
        window.open('android-settings://apps', '_system');
      } else if (Capacitor.getPlatform() === 'ios') {
        window.open('app-settings:', '_system');
      }
    } else {
      // En web, mostrar instrucciones
      alert('Ve a la configuración de tu navegador y permite el acceso a la cámara para este sitio.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Error de Permisos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>

          <div className="space-y-3">
            <button
              onClick={requestPermissions}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              🔓 Solicitar Permisos
            </button>

            <button
              onClick={openSettings}
              className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              ⚙️ Abrir Configuración
            </button>

            <button
              onClick={checkPermissions}
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
            >
              🔄 Reintentar
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">📋 Permisos requeridos:</p>
            <ul className="text-left space-y-1">
              <li>• 📷 Acceso a la cámara</li>
              <li>• 💾 Almacenamiento de archivos</li>
              <li>• 📤 Compartir documentos</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!permissions.camera) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Permisos de Cámara Requeridos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            La aplicación necesita acceso a la cámara para escanear documentos.
          </p>

          <button
            onClick={requestPermissions}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            ✅ Permitir Acceso a Cámara
          </button>
        </div>
      </div>
    );
  }

  return children;
}