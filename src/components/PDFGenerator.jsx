'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import ShareButton from './ShareButton';

export default function PDFGenerator({ images, disabled = false }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [generatedPdfPath, setGeneratedPdfPath] = useState(null);

  const generatePDF = async () => {
    if (!images || images.length === 0) {
      setError('No hay imágenes para generar el PDF');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setMessage(null);

      // Crear nuevo documento PDF
      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Procesar cada imagen
      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        if (i > 0) {
          pdf.addPage(); // Nueva página para cada imagen
        }

        try {
          // Convertir la imagen a formato que jsPDF pueda usar
          const imgData = await loadImageAsBase64(image.webPath);

          // Calcular dimensiones para que quepa en la página
          const img = new Image();
          img.onload = () => {
            const imgAspectRatio = img.width / img.height;
            const pageAspectRatio = pdfWidth / pdfHeight;

            let imgWidth, imgHeight;

            if (imgAspectRatio > pageAspectRatio) {
              // Imagen más ancha que la página
              imgWidth = pdfWidth;
              imgHeight = pdfWidth / imgAspectRatio;
            } else {
              // Imagen más alta que la página
              imgHeight = pdfHeight;
              imgWidth = pdfHeight * imgAspectRatio;
            }

            // Centrar la imagen en la página
            const xOffset = (pdfWidth - imgWidth) / 2;
            const yOffset = (pdfHeight - imgHeight) / 2;

            // Agregar la imagen al PDF
            pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);

            // Agregar número de página
            pdf.setFontSize(10);
            pdf.text(
              `Página ${i + 1} de ${images.length}`,
              pdfWidth - 30,
              pdfHeight - 10
            );
          };
          img.src = imgData;

        } catch (imgError) {
          console.error(`Error procesando imagen ${image.fileName}:`, imgError);
          // Continuar con la siguiente imagen
        }
      }

      // Generar nombre único para el PDF
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const pdfFileName = `escaneo_completo_${timestamp}.pdf`;

      // Convertir PDF a blob para guardado
      const pdfBlob = pdf.output('blob');

      // Convertir blob a base64 para guardar en el dispositivo
      const base64Data = await convertBlobToBase64(pdfBlob);

      // Guardar el PDF en el sistema de archivos
      const savedFile = await Filesystem.writeFile({
        path: pdfFileName,
        data: base64Data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      // Guardar la ruta del PDF generado para compartir
      setGeneratedPdfPath(savedFile.uri);

      setMessage('✅ PDF generado correctamente');

      // Mostrar información del archivo guardado
      console.log('PDF guardado en:', savedFile.uri);

    } catch (err) {
      console.error('Error generando PDF:', err);
      setError('Error al generar el PDF. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Función auxiliar para cargar imagen como base64
  const loadImageAsBase64 = (imagePath) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = reject;
      img.src = imagePath;
    });
  };

  // Función auxiliar para convertir blob a base64
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Botón para generar PDF */}
      <div className="text-center mb-6">
        <button
          onClick={generatePDF}
          disabled={disabled || isGenerating || images.length === 0}
          className={`
            px-8 py-4 rounded-full font-semibold text-white text-lg
            transition-all duration-300 transform hover:scale-105
            ${disabled || isGenerating || images.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generando PDF...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>📄</span>
              <span>Generar PDF ({images.length} imágenes)</span>
            </div>
          )}
        </button>

        {images.length === 0 && (
          <p className="text-gray-500 text-sm mt-2">
            Escanea al menos una imagen para generar el PDF
          </p>
        )}
      </div>

      {/* Mensajes de estado */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✅</span>
            <span>{message}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Información del PDF */}
      {images.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 Información del PDF:</h4>
          <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
            <li>• Se creará un PDF con {images.length} página{images.length !== 1 ? 's' : ''}</li>
            <li>• Cada imagen ocupará una página completa</li>
            <li>• Se guardará en la carpeta de documentos del dispositivo</li>
            <li>• El archivo tendrá un nombre único con fecha y hora</li>
          </ul>
        </div>
      )}

      {/* Botón de compartir (solo visible después de generar PDF) */}
      {generatedPdfPath && (
        <div className="mt-6">
          <ShareButton
            pdfPath={generatedPdfPath}
            disabled={false}
          />
        </div>
      )}
    </div>
  );
}