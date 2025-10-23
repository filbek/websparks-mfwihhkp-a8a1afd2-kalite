import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Document } from '../../types/documents';
import { User, Facility } from '../../types';

interface DocumentCardProps {
  document: Document;
  onDownload: (document: Document) => void;
  onDelete?: (documentId: string) => void;
  showActions?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDownload,
  onDelete,
  showActions = true
}) => {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'bi-file-earmark-pdf text-danger-600';
    if (fileType.includes('word') || fileType.includes('document')) return 'bi-file-earmark-word text-primary-600';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'bi-file-earmark-excel text-success-600';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'bi-file-earmark-ppt text-warning-600';
    if (fileType.includes('image')) return 'bi-file-earmark-image text-info-600';
    return 'bi-file-earmark text-secondary-600';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0">
            <i className={`bi ${getFileIcon(document.file_type)} text-2xl`}></i>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-secondary-900 truncate">
              {document.title}
            </h3>
            
            {document.description && (
              <p className="mt-1 text-sm text-secondary-600 line-clamp-2">
                {document.description}
              </p>
            )}
            
            <div className="mt-2 flex items-center space-x-4 text-xs text-secondary-500">
              <span className="flex items-center">
                <i className="bi bi-folder mr-1"></i>
                {document.category?.name || 'Kategorisiz'}
              </span>
              <span className="flex items-center">
                <i className="bi bi-hdd mr-1"></i>
                {formatFileSize(document.file_size)}
              </span>
              <span className="flex items-center">
                <i className="bi bi-clock mr-1"></i>
                {new Date(document.created_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
            
            <div className="mt-2 flex items-center space-x-4 text-xs text-secondary-500">
              <span className="flex items-center">
                <i className="bi bi-person mr-1"></i>
                {document.uploader?.display_name || 'Bilinmeyen Kullanıcı'}
              </span>
              <span className="flex items-center">
                <i className="bi bi-building mr-1"></i>
                {document.facility?.name || 'Bilinmeyen Şube'}
              </span>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(document)}
              className="text-primary-600 border-primary-600 hover:bg-primary-50"
            >
              <i className="bi bi-download mr-1"></i>
              İndir
            </Button>
            
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(document.id)}
                className="text-danger-600 border-danger-600 hover:bg-danger-50"
              >
                <i className="bi bi-trash"></i>
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};