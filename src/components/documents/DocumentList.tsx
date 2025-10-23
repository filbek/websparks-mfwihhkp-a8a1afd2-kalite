import React from 'react';
import { DocumentCard } from './DocumentCard';
import { Document } from '../../types/documents';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  error: string | null;
  onDelete?: (documentId: string) => void;
  onDownload: (document: Document) => void;
  showActions?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  error,
  onDelete,
  onDownload,
  showActions = true
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="bi bi-exclamation-triangle text-4xl text-danger-600"></i>
        </div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Hata Oluştu</h3>
        <p className="text-secondary-600">{error}</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="bi bi-file-earmark text-4xl text-secondary-400"></i>
        </div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Doküman Bulunamadı</h3>
        <p className="text-secondary-600">Arama kriterlerinize uygun doküman bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-secondary-900">
          {documents.length} Doküman
        </h2>
      </div>
      
      <div className="grid gap-4">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onDownload={onDownload}
            onDelete={onDelete}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  );
};