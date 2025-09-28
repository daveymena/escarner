'use client';

import { useState, useEffect } from 'react';
import SmartScanner from '../components/SmartScanner';
import BatchScanner from '../components/BatchScanner';
import ImageGallery from '../components/ImageGallery';
import PDFGenerator from '../components/PDFGenerator';
import ImageProcessor from '../components/ImageProcessor';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

export default function Home() {
  const [scannedImages, setScannedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingImage, setProcessingImage] = useState(null);
  const { isDark } = useTheme();

  // Cargar imágenes guardadas al iniciar la app
  useEffect(() => {
    loadSavedImages();
  }, []);

  const loadSavedImages = async () => {
    try {
      setIsLoading(true);
      // Por ahora, comenzamos con un array vacío
      // En una implementación más avanzada, podrías cargar imágenes guardadas
      setScannedImages([]);
    } catch (error) {
      console.error('Error cargando imágenes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentCapture = (smartDocument) => {
    // El SmartScanner ya procesa automáticamente la imagen
    // Solo agregamos el documento inteligente a la galería
    setScannedImages(prev => [...prev, smartDocument]);
  };

  const handleBatchComplete = (batchDocuments) => {
    // Agregar todos los documentos del batch a la galería
    setScannedImages(prev => [...prev, ...batchDocuments]);
  };

  const handleImageProcessed = (processedImage) => {
    setScannedImages(prev => [...prev, processedImage]);
    setProcessingImage(null);
  };

  const handleProcessingCancel = () => {
    setProcessingImage(null);
  };

  const handleRemoveImage = (imageId) => {
    setScannedImages(prev => prev.filter(img => img.id !== imageId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando Mi Escáner PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                📄 Mi Escáner PDF
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
                Escanea documentos y genera PDFs fácilmente
              </p>
            </div>
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Smart Scanner */}
        <div className="mb-12">
          <SmartScanner
            onDocumentCapture={handleDocumentCapture}
            disabled={false}
          />
        </div>

        {/* Batch Scanner */}
        <div className="mb-12">
          <BatchScanner
            onBatchComplete={handleBatchComplete}
            disabled={false}
          />
        </div>

        {/* Image Gallery */}
        <div className="mb-12">
          <ImageGallery
            images={scannedImages}
            onRemoveImage={handleRemoveImage}
          />
        </div>

        {/* PDF Generator */}
        <div className="mb-12">
          <PDFGenerator
            images={scannedImages}
            disabled={false}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Desarrollado con Next.js y Capacitor
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
            {new Date().getFullYear()} - Mi Escáner PDF
          </p>
        </div>
      </footer>

      {/* Modal de procesamiento de imagen */}
      {processingImage && (
        <ImageProcessor
          image={processingImage}
          onProcessed={handleImageProcessed}
          onCancel={handleProcessingCancel}
        />
      )}
    </div>
  );
}
