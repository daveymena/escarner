'use client';

import { useState } from 'react';

export default function ImageGallery({ images, onRemoveImage }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleRemoveImage = (imageId, event) => {
    event.stopPropagation(); // Evitar que se abra el modal al hacer clic en eliminar
    onRemoveImage(imageId);
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-6xl mb-4">📷</div>
        <p>No hay imágenes escaneadas aún</p>
        <p className="text-sm">Presiona el botón "Escanear Documento" para comenzar</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Encabezado de la galería */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          📸 Imágenes Escaneadas ({images.length})
        </h3>
        <p className="text-gray-600 text-sm">
          Haz clic en una imagen para verla en grande
        </p>
      </div>

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            {/* Imagen en miniatura */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
              <img
                src={image.webPath}
                alt={`Escaneo ${image.fileName}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay con información */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                <div className="p-2 w-full">
                  <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">
                    {image.fileName}
                  </p>
                </div>
              </div>

              {/* Botón de eliminar */}
              <button
                onClick={(e) => handleRemoveImage(image.id, e)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
                title="Eliminar imagen"
              >
                <span className="text-xs">×</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para ver imagen en grande */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Botón cerrar */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-300"
            >
              <span className="text-xl">×</span>
            </button>

            {/* Imagen grande */}
            <div className="bg-white rounded-lg p-4 max-h-full overflow-auto">
              <img
                src={selectedImage.webPath}
                alt={`Escaneo ${selectedImage.fileName}`}
                className="max-w-full max-h-[70vh] object-contain mx-auto block"
              />

              {/* Información de la imagen */}
              <div className="mt-4 text-center">
                <p className="text-gray-600 font-medium">{selectedImage.fileName}</p>
                <p className="text-gray-500 text-sm">
                  Escaneado el: {new Date(selectedImage.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}