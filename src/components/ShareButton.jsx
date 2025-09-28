'use client';

import { useState } from 'react';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

export default function ShareButton({ pdfPath, disabled = false }) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareMethod, setShareMethod] = useState(null);

  const shareOptions = [
    {
      id: 'system',
      name: 'Compartir',
      icon: '📤',
      description: 'Usar opciones del sistema'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      description: 'Compartir por WhatsApp'
    },
    {
      id: 'email',
      name: 'Email',
      icon: '✉️',
      description: 'Enviar por correo'
    },
    {
      id: 'drive',
      name: 'Google Drive',
      icon: '☁️',
      description: 'Subir a la nube'
    }
  ];

  const handleShare = async (method) => {
    if (!pdfPath) return;

    try {
      setIsSharing(true);
      setShareMethod(method);

      switch (method) {
        case 'system':
          await shareWithSystem();
          break;
        case 'whatsapp':
          await shareWithWhatsApp();
          break;
        case 'email':
          await shareWithEmail();
          break;
        case 'drive':
          await shareWithDrive();
          break;
        default:
          console.log('Método de compartir no reconocido');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      alert('Error al compartir el archivo. Inténtalo de nuevo.');
    } finally {
      setIsSharing(false);
      setShareMethod(null);
    }
  };

  const shareWithSystem = async () => {
    try {
      await Share.share({
        title: 'Compartir PDF',
        text: 'Aquí tienes el documento escaneado',
        url: pdfPath,
        dialogTitle: 'Compartir documento PDF'
      });
    } catch (error) {
      console.error('Error con Share API:', error);
      // Fallback: descargar archivo
      await downloadFile();
    }
  };

  const shareWithWhatsApp = async () => {
    const fileName = pdfPath.split('/').pop();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `Documento escaneado: ${fileName} - Descárgalo aquí: ${window.location.origin}`
    )}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const shareWithEmail = async () => {
    const fileName = pdfPath.split('/').pop();
    const subject = encodeURIComponent('Documento escaneado');
    const body = encodeURIComponent(
      `Hola,\n\nTe envío el documento escaneado: ${fileName}\n\nSaludos`
    );

    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  const shareWithDrive = async () => {
    // Simular subida a Google Drive
    // En una implementación real, usarías la API de Google Drive
    alert('Función de subida a Google Drive próximamente disponible');
  };

  const downloadFile = async () => {
    try {
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = pdfPath;
      link.download = pdfPath.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón principal de compartir */}
      <button
        onClick={() => document.getElementById('share-modal').showModal()}
        disabled={disabled || !pdfPath}
        className={`
          w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300
          ${disabled || !pdfPath
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-500 hover:bg-purple-600 active:scale-95 shadow-lg hover:shadow-xl'
          }
        `}
      >
        📤 Compartir PDF
      </button>

      {/* Modal de opciones de compartir */}
      <dialog
        id="share-modal"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 p-0 max-w-md w-full"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Compartir Documento
            </h3>
            <button
              onClick={() => document.getElementById('share-modal').close()}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Opciones de compartir */}
          <div className="space-y-3">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  handleShare(option.id);
                  document.getElementById('share-modal').close();
                }}
                disabled={isSharing}
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {option.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Loading overlay */}
          {isSharing && (
            <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Compartiendo...
                </p>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}