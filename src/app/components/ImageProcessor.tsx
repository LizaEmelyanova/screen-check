// components/ImageProcessor.tsx
"use client";

import { useState, useEffect } from "react";

interface Detection {
  class: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
  class_id: number;
}

interface ProcessedImageData {
  success: boolean;
  filename: string;
  detections: Detection[];
  detection_count: number;
  class_summary: Record<string, number>;
  processed_image: string; // base64 encoded image
  processing_time: number;
  error?: string; // Добавляем опциональное поле для ошибок
}

interface ImageProcessorProps {
  selectedFile: File | null;
  onReset: () => void;
}

export default function ImageProcessor({ selectedFile, onReset }: ImageProcessorProps) {
  const [processedData, setProcessedData] = useState<ProcessedImageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Настройте URL вашего Django API
  const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (selectedFile) {
      processImage(selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const processImage = async (file: File) => {
    setLoading(true);
    setError(null);
    
    // Создаем предпросмотр
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${DJANGO_API_URL}/api/process-image/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: ProcessedImageData = await response.json();
      
      if (data.success) {
        setProcessedData(data);
      } else {
        throw new Error(data.error || 'Обработка изображения не удалась');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Не удалось обработать изображение');
      setProcessedData(null);
    } finally {
      setLoading(false);
    }
  };

  // Если идет загрузка и есть предпросмотр
  if (loading && localPreview) {
    return (
      <div className="processing-state">
        <div className="preview-container">
          <img 
            src={localPreview} 
            alt="Preview" 
            className="preview-image"
          />
          <div className="processing-overlay">
            <div className="spinner"></div>
            <p>Обработка с помощью YOLO...</p>
          </div>
        </div>
        <style jsx>{`
          .processing-state {
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .preview-container {
            position: relative;
            border-radius: 8px;
            overflow: hidden;
            width: auto;
            height: 500px;
          }
          
          .preview-image {
            width: auto;
            height: 500px;
            border-radius: 8px;
            opacity: 0.7;
            display: block;
          }
          
          .processing-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.7);
            color: white;
          }
          
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .processing-overlay p {
            margin: 0;
            font-size: 14px;
            color: white;
          }
        `}</style>
      </div>
    );
  }

  // Если есть ошибка
  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button 
          onClick={onReset}
          className="retry-button"
        >
          Попробовать снова
        </button>
        <style jsx>{`
          .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 12px;
            color: #721c24;
            text-align: center;
            margin-bottom: 20px;
          }
          
          .error-icon {
            font-size: 32px;
            margin-bottom: 16px;
          }
          
          p {
            margin: 0 0 20px 0;
            font-size: 14px;
          }
          
          .retry-button {
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
          }
          
          .retry-button:hover {
            background: #c82333;
          }
        `}</style>
      </div>
    );
  }

  // Если есть обработанное изображение
  if (processedData?.processed_image) {
    return (
      <div className="processed-image-container">
        <div className="image-header">
          <h3>Результат обработки</h3>
          <button 
            onClick={onReset}
            className="clear-button"
          >
            ✕ Загрузить другое
          </button>
        </div>
        
        <div className="image-wrapper">
          <img
            src={processedData.processed_image}
            alt="Processed with YOLO"
            className="processed-image"
          />
          
          <div className="detections-info">
            <div className="detection-stats">
              <span className="stat">
                <strong>{processedData.processing_time.toFixed(2)}</strong> сек
              </span>
            </div>
            
            {Object.keys(processedData.class_summary).length > 0 && (
              <div className="classes-list">
                <h4>Обнаружены:</h4>
                <div className="class-tags">
                  {Object.entries(processedData.class_summary).map(([className, count]) => (
                    <span key={className} className="class-tag">
                      {className}: <strong>{count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {processedData.detections.length > 0 && (
              <div className="detections-details">
                <h4>Детали:</h4>
                <div className="detections-grid">
                  {processedData.detections.map((det, index) => (
                    <div key={index} className="detection-item">
                      <span className="detection-class">{det.class}</span>
                      <span className="detection-confidence">
                        {(det.confidence * 100).toFixed(1)}%
                      </span>
                      <span className="detection-size">
                        {det.bbox.width}×{det.bbox.height}px
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <style jsx>{`
          .processed-image-container {
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
          }
          
          .image-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          
          .image-header h3 {
            margin: 0;
            color: #333;
            font-size: 18px;
            font-weight: 600;
          }
          
          .clear-button {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 8px 16px;
            color: #495057;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
          }
          
          .clear-button:hover {
            background: #e9ecef;
            border-color: #adb5bd;
          }
          
          .image-wrapper {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          
          .processed-image {
            width: auto;
            height: 500px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .detections-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
          }
          
          .detection-stats {
            display: flex;
            gap: 20px;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #dee2e6;
          }
          
          .stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #6c757d;
            font-size: 13px;
            flex: 1;
          }
          
          .stat strong {
            font-size: 24px;
            color: #007bff;
            line-height: 1;
          }
          
          .classes-list {
            margin-bottom: 16px;
          }
          
          .classes-list h4 {
            margin: 0 0 12px 0;
            color: #495057;
            font-size: 16px;
          }
          
          .class-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .class-tag {
            background: #e7f5ff;
            color: #0a58ca;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
          }
          
          .class-tag strong {
            margin-left: 4px;
          }
          
          .detections-details h4 {
            margin: 0 0 12px 0;
            color: #495057;
            font-size: 16px;
          }
          
          .detections-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            max-height: 200px;
            overflow-y: auto;
            padding-right: 5px;
          }
          
          .detections-grid::-webkit-scrollbar {
            width: 6px;
          }
          
          .detections-grid::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          
          .detections-grid::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
          }
          
          .detection-item {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .detection-class {
            font-weight: 600;
            color: #495057;
            font-size: 14px;
          }
          
          .detection-confidence {
            color: #28a745;
            font-size: 12px;
          }
          
          .detection-size {
            color: #6c757d;
            font-size: 12px;
          }
        `}</style>
      </div>
    );
  }

  // Если файл выбран, но еще не началась обработка
  if (selectedFile && !loading && !processedData) {
    return (
      <div className="ready-state">
        <p>Изображение готово к обработке</p>
        <button 
          onClick={() => processImage(selectedFile)}
          className="process-button"
        >
          Начать обработку
        </button>
        <style jsx>{`
          .ready-state {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
          }
          
          p {
            margin: 0 0 16px 0;
            color: #495057;
          }
          
          .process-button {
            background: #28a745;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
          }
          
          .process-button:hover {
            background: #218838;
          }
        `}</style>
      </div>
    );
  }

  // По умолчанию - ничего не показываем
  return null;
}