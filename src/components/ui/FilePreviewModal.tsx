import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string | null;
  uploadedBy?: string;
  uploadedAt?: string;
  onDownload?: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileType,
  fileSize,
  fileUrl,
  uploadedBy,
  uploadedAt,
  onDownload
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
      setZoom(100);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    }
  }, [isOpen, blobUrl]);

  useEffect(() => {
    const fetchBlob = async () => {
      if (!fileUrl || !isOpen) return;

      const isPDF = fileType === 'application/pdf';
      if (!isPDF) {
        setBlobUrl(fileUrl);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error('Dosya yüklenemedi');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (error) {
        console.error('Error fetching blob:', error);
        setBlobUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlob();
  }, [fileUrl, fileType, isOpen]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf';
  const canPreview = isImage || isPDF;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderPreview = () => {
    if (!fileUrl || loading || (isPDF && !blobUrl)) {
      return (
        <div className="flex items-center justify-center h-96 bg-secondary-50 dark:bg-secondary-800 rounded-lg transition-colors">
          <div className="text-center">
            <i className="bi bi-hourglass-split text-4xl text-secondary-400 mb-2 animate-spin"></i>
            <p className="text-secondary-600 dark:text-secondary-400">Dosya yükleniyor...</p>
          </div>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className={`overflow-auto bg-secondary-900 rounded-lg ${isFullscreen ? 'fixed inset-0 z-50 p-8' : 'max-h-96'}`}>
          <div className="flex items-center justify-center min-h-full">
            <img
              src={blobUrl || fileUrl}
              alt={fileName}
              style={{ transform: `scale(${zoom / 100})` }}
              className="max-w-full h-auto transition-transform duration-200"
            />
          </div>
        </div>
      );
    }

    if (isPDF && blobUrl) {
      return (
        <div className={`bg-secondary-50 dark:bg-secondary-800 rounded-lg ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96'} transition-colors`}>
          <iframe
            src={`${blobUrl}#view=FitH`}
            className="w-full h-full rounded-lg"
            title={fileName}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-96 bg-secondary-50 dark:bg-secondary-800 rounded-lg transition-colors">
        <div className="text-center">
          <i className="bi bi-file-earmark text-6xl text-secondary-400 mb-4"></i>
          <p className="text-secondary-900 dark:text-white font-medium mb-2">Önizleme Desteklenmiyor</p>
          <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-4">Bu dosya türü için önizleme yapılamıyor</p>
          {onDownload && (
            <Button onClick={onDownload} size="sm">
              <i className="bi bi-download mr-2"></i>
              Dosyayı İndir
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dosya Önizleme"
      size="large"
    >
      <div className="space-y-4">
        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className={`bi ${isImage ? 'bi-file-earmark-image' : isPDF ? 'bi-file-earmark-pdf' : 'bi-file-earmark'} text-2xl text-primary-600 dark:text-primary-400`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-secondary-900 dark:text-white truncate">{fileName}</h3>
                <div className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400">
                  <span>{formatFileSize(fileSize)}</span>
                  {uploadedBy && (
                    <>
                      <span>•</span>
                      <span>{uploadedBy}</span>
                    </>
                  )}
                  {uploadedAt && (
                    <>
                      <span>•</span>
                      <span>{formatDate(uploadedAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {canPreview && isImage && (
          <div className="flex items-center justify-between bg-secondary-50 dark:bg-secondary-800 rounded-lg p-3 transition-colors">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <i className="bi bi-zoom-out"></i>
              </Button>
              <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300 min-w-[60px] text-center">
                {zoom}%
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <i className="bi bi-zoom-in"></i>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetZoom}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleFullscreen}
            >
              <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'} mr-2`}></i>
              {isFullscreen ? 'Çıkış' : 'Tam Ekran'}
            </Button>
          </div>
        )}

        {renderPreview()}

        <div className="flex justify-end space-x-3 pt-4">
          {onDownload && (
            <Button variant="outline" onClick={onDownload}>
              <i className="bi bi-download mr-2"></i>
              İndir
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>

      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-[60] w-10 h-10 bg-white dark:bg-secondary-800 rounded-full shadow-lg flex items-center justify-center hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
        >
          <i className="bi bi-x-lg text-secondary-900 dark:text-white"></i>
        </button>
      )}
    </Modal>
  );
};
