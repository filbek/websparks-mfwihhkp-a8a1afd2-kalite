import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentUpload } from '../components/documents/DocumentUpload';
import { SearchBar } from '../components/documents/SearchBar';
import { CategoryFilter } from '../components/documents/CategoryFilter';
import { useDocuments } from '../hooks/useDocuments';
import { useDocumentCategories } from '../hooks/useDocumentCategories';
import { DocumentFilters } from '../types/documents';

export const DocumentManagement: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const { documents, loading, error, uploadDocument, deleteDocument, downloadDocument } = useDocuments(filters);
  const { categories } = useDocumentCategories();

  const handleFilterChange = (newFilters: Partial<DocumentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleUploadDocument = async (formData: any) => {
    try {
      setUploadLoading(true);
      await uploadDocument(formData);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Doküman yükleme hatası:', error);
      alert('Doküman yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Bu dokümanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await deleteDocument(documentId);
      } catch (error) {
        console.error('Doküman silme hatası:', error);
        alert('Doküman silinirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">Doküman Yönetimi</h1>
            <p className="text-secondary-600">Kalite dokümanlarını yönetin ve paylaşın</p>
          </div>
          
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <i className="bi bi-plus-lg mr-2"></i>
            Yeni Doküman Yükle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar onSearch={(search) => handleFilterChange({ search })} />
          <CategoryFilter
            categories={categories}
            selectedCategory={filters.category_id}
            onCategoryChange={(category_id) => handleFilterChange({ category_id })}
          />
        </div>
      </div>

      {/* Document List */}
      <DocumentList
        documents={documents}
        loading={loading}
        error={error}
        onDelete={handleDeleteDocument}
        onDownload={downloadDocument}
      />

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Doküman Yükle"
        size="lg"
      >
        <DocumentUpload
          categories={categories}
          onSubmit={handleUploadDocument}
          onCancel={() => setIsUploadModalOpen(false)}
          loading={uploadLoading}
        />
      </Modal>
    </div>
  );
};