'use client';

import { useState, useRef } from 'react';

export default function ImageProcessor({ image, onProcessed, onCancel }) {
  const [processedImage, setProcessedImage] = useState(image.webPath);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState('none');
  const canvasRef = useRef(null);

  const filters = [
    { id: 'none', name: 'Original', icon: '📷' },
    { id: 'grayscale', name: 'B/N', icon: '⚫' },
    { id: 'contrast', name: 'Contraste', icon: '🔆' },
    { id: 'brightness', name: 'Brillo', icon: '🌟' },
    { id: 'sharpen', name: 'Nitidez', icon: '🔍' },
    { id: 'blur', name: 'Suavizado', icon: '🌫️' }
  ];

  const applyFilter = async (filterType) => {
    setIsProcessing(true);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Ajustar tamaño del canvas
        canvas.width = img.width;
        canvas.height = img.height;

        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Aplicar filtro según el tipo
        let filterValue = '';

        switch (filterType) {
          case 'grayscale':
            filterValue = 'grayscale(100%)';
            break;
          case 'contrast':
            filterValue = 'contrast(150%)';
            break;
          case 'brightness':
            filterValue = 'brightness(110%)';
            break;
          case 'sharpen':
            filterValue = 'contrast(120%) brightness(105%)';
            break;
          case 'blur':
            filterValue = 'blur(1px)';
            break;
          default:
            filterValue = 'none';
        }

        // Aplicar filtro si es soportado
        if (filterType !== 'none') {
          ctx.filter = filterValue;
        }

        // Dibujar imagen con filtro
        ctx.drawImage(img, 0, 0);

        // Convertir a blob para compresión
        canvas.toBlob((blob) => {
          const compressedUrl = URL.createObjectURL(blob);
          setProcessedImage(compressedUrl);
          setIsProcessing(false);
          resolve(compressedUrl);
        }, 'image/jpeg', 0.8); // Compresión del 80%
      };

      img.src = image.webPath;
    });
  };

  const handleFilterChange = async (filterType) => {
    setFilter(filterType);
    if (filterType !== 'none') {
      await applyFilter(filterType);
    } else {
      setProcessedImage(image.webPath);
    }
  };

  const handleSave = () => {
    const processedImageData = {
      ...image,
      webPath: processedImage,
      processed: true,
      filter: filter,
      compressed: true
    };
    onProcessed(processedImageData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Editar Imagen
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Imagen principal */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <div className="relative flex items-center justify-center">
            <img
              src={processedImage}
              alt="Vista previa"
              className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
            />

            {/* Loading overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Procesando...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="p-4 border-t dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Filtros de mejora:
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {filters.map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => handleFilterChange(filterOption.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-1
                  ${filter === filterOption.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }
                `}
              >
                <span className="text-lg">{filterOption.icon}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {filterOption.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Información de compresión */}
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-600 dark:text-blue-400">
              💾 Imagen optimizada (80% calidad)
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {filter !== 'none' && `Filtro: ${filters.find(f => f.id === filter)?.name}`}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 p-4 border-t dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            {isProcessing ? 'Procesando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Canvas oculto para procesamiento */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  );
}