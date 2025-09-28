'use client';

import { useState } from 'react';
import { createWorker } from 'tesseract.js';

export default function OCRProcessor({ image, onTextExtracted, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState('spa+eng');

  const languages = [
    { code: 'spa', name: 'Español' },
    { code: 'eng', name: 'English' },
    { code: 'spa+eng', name: 'Español + English' },
    { code: 'fra', name: 'Français' },
    { code: 'por', name: 'Português' },
    { code: 'ita', name: 'Italiano' },
    { code: 'deu', name: 'Deutsch' }
  ];

  const extractText = async () => {
    if (!image) return;

    try {
      setIsProcessing(true);
      setProgress(0);

      const worker = await createWorker();

      // Configurar idioma
      await worker.loadLanguage(language);
      await worker.initialize(language);

      // Configurar parámetros para mejor reconocimiento
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789áéíóúüñÁÉÍÓÚÜÑ.,;:!?¿¡()[]{}"\'- ',
        tessedit_pageseg_mode: 1, // Automatic page segmentation with OSD
        preserve_interword_spaces: 1
      });

      // Procesar imagen
      const { data } = await worker.recognize(image);

      setExtractedText(data.text);
      setProgress(100);

      // Limpiar worker
      await worker.terminate();

      // Notificar al componente padre
      onTextExtracted(data.text);

    } catch (error) {
      console.error('Error en OCR:', error);
      setExtractedText('Error procesando la imagen. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      alert('Texto copiado al portapapeles');
    }
  };

  const downloadText = () => {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `texto_extraido_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            🔍 Reconocimiento de Texto (OCR)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Imagen original */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <img
            src={image}
            alt="Imagen para OCR"
            className="max-w-full max-h-64 object-contain mx-auto block rounded-lg"
          />
        </div>

        {/* Configuración de OCR */}
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Idioma:
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={extractText}
            disabled={isProcessing}
            className={`
              w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300
              ${isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando... {progress}%</span>
              </div>
            ) : (
              '🔍 Extraer Texto'
            )}
          </button>
        </div>

        {/* Resultados de OCR */}
        {extractedText && (
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 dark:text-white">
                📝 Texto Extraído:
              </h4>
              <div className="space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                >
                  📋 Copiar
                </button>
                <button
                  onClick={downloadText}
                  className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors"
                >
                  💾 Descargar
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {extractedText}
              </pre>
            </div>
          </div>
        )}

        {/* Información */}
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-t dark:border-gray-700">
          <div className="text-sm text-blue-600 dark:text-blue-400">
            <p className="mb-1">💡 <strong>Consejos para mejor OCR:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Asegúrate de que el texto esté bien iluminado</li>
              <li>Evita sombras y reflejos en la imagen</li>
              <li>Usa el idioma correcto para mejor precisión</li>
              <li>Para documentos, usa el modo "Documento" para mejor calidad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}