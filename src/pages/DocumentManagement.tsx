import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentUpload } from '../components/documents/DocumentUpload';
import { SearchBar } from '../components/documents/SearchBar';
import { CategoryFilter } from '../components/documents/CategoryFilter';
import { FolderList } from '../components/documents/FolderList';
import { FolderForm } from '../components/documents/FolderForm';
import { Breadcrumb, BreadcrumbItem } from '../components/documents/Breadcrumb';
import { PDFPreview } from '../components/documents/PDFPreview';
import { useDocuments } from '../hooks/useDocuments';
import { useDocumentCategories } from '../hooks/useDocumentCategories';
import { useFolders } from '../hooks/useFolders';
import { DocumentFilters, FolderFilters, DocumentFolder, Document } from '../types/documents';

type ViewTab = 'folders' | 'files';

export const DocumentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('folders');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DocumentFolder | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([]);
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [folderFilters, setFolderFilters] = useState<FolderFilters>({});
  const [uploadLoading, setUploadLoading] = useState(false);
  const [folderLoading, setFolderLoading] = useState(false);
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const { documents, loading, error, uploadDocument, deleteDocument, downloadDocument, getDocumentUrl } = useDocuments(filters);
  const { folders, loading: foldersLoading, error: foldersError, createFolder, updateFolder, deleteFolder, getFolderPath } = useFolders(folderFilters);
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

  const handleFolderOpen = async (folder: DocumentFolder) => {
    setCurrentFolderId(folder.id);
    setFilters({ folder_id: folder.id });
    setFolderFilters({ parent_id: folder.id });
    setActiveTab('files');

    const path = await getFolderPath(folder.id);
    setBreadcrumbPath(path.map(f => ({ id: f.id, name: f.name })));
  };

  const handleCreateFolder = () => {
    setEditingFolder(null);
    setIsFolderModalOpen(true);
  };

  const handleEditFolder = (folder: DocumentFolder) => {
    setEditingFolder(folder);
    setIsFolderModalOpen(true);
  };

  const handleFolderSubmit = async (formData: any) => {
    try {
      setFolderLoading(true);
      if (editingFolder) {
        await updateFolder(editingFolder.id, formData);
      } else {
        await createFolder({ ...formData, parent_id: currentFolderId });
      }
      setIsFolderModalOpen(false);
      setEditingFolder(null);
    } catch (error) {
      console.error('Klasör işlemi hatası:', error);
      alert('Klasör işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setFolderLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (window.confirm('Bu klasörü silmek istediğinizden emin misiniz? İçindeki dokümanlar korunacaktır.')) {
      try {
        await deleteFolder(folderId);
      } catch (error) {
        console.error('Klasör silme hatası:', error);
        alert('Klasör silinirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const handleBreadcrumbNavigate = async (folderId: string | null) => {
    if (folderId === null) {
      setCurrentFolderId(undefined);
      setFolderFilters({});
      setFilters({});
      setBreadcrumbPath([]);
      setActiveTab('folders');
    } else {
      setCurrentFolderId(folderId);
      setFilters({ folder_id: folderId });
      setFolderFilters({ parent_id: folderId });
      setActiveTab('files');

      const path = await getFolderPath(folderId);
      setBreadcrumbPath(path.map(f => ({ id: f.id, name: f.name })));
    }
  };

  const handlePreviewDocument = async (document: Document) => {
    try {
      const url = await getDocumentUrl(document);
      setPreviewUrl(url);
      setPreviewDocument(document);
      setIsPDFPreviewOpen(true);
    } catch (error) {
      console.error('PDF önizleme hatası:', error);
      alert('PDF önizlemesi yüklenirken bir hata oluştu.');
    }
  };

  const handleClosePDFPreview = () => {
    setIsPDFPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setPreviewDocument(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Doküman Yönetimi</h1>
            <p className="text-secondary-600 dark:text-secondary-400">Kalite dokümanlarını yönetin ve paylaşın</p>
          </div>

          <div className="flex items-center space-x-3">
            {activeTab === 'files' && currentFolderId && (
              <Button
                onClick={handleCreateFolder}
                className="bg-secondary-600 hover:bg-secondary-700 text-white"
              >
                <i className="bi bi-folder-plus mr-2"></i>
                Alt Klasör Oluştur
              </Button>
            )}
            {activeTab === 'folders' && (
              <Button
                onClick={handleCreateFolder}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <i className="bi bi-folder-plus mr-2"></i>
                Yeni Klasör
              </Button>
            )}
            {activeTab === 'files' && (
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <i className="bi bi-plus-lg mr-2"></i>
                Yeni Doküman Yükle
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 transition-colors">
        <div className="flex items-center border-b border-secondary-200 dark:border-secondary-700">
          <button
            onClick={() => setActiveTab('folders')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === 'folders'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-700'
              }`}
          >
            <i className="bi bi-folder"></i>
            <span>Klasörler</span>
            {folders.length > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'folders' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
                }`}>
                {folders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === 'files'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-700'
              }`}
          >
            <i className="bi bi-file-earmark"></i>
            <span>Dosyalar</span>
            {documents.length > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'files' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
                }`}>
                {documents.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {breadcrumbPath.length > 0 && (
        <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 transition-colors">
          <Breadcrumb
            items={breadcrumbPath}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            onSearch={(search) =>
              activeTab === 'folders'
                ? setFolderFilters(prev => ({ ...prev, search }))
                : handleFilterChange({ search })
            }
          />
          <CategoryFilter
            categories={categories}
            selectedCategory={activeTab === 'folders' ? folderFilters.category_id : filters.category_id}
            onCategoryChange={(category_id) =>
              activeTab === 'folders'
                ? setFolderFilters(prev => ({ ...prev, category_id }))
                : handleFilterChange({ category_id })
            }
          />
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'folders' ? (
        <FolderList
          folders={folders}
          loading={foldersLoading}
          error={foldersError}
          onFolderOpen={handleFolderOpen}
          onFolderEdit={handleEditFolder}
          onFolderDelete={handleDeleteFolder}
        />
      ) : (
        <DocumentList
          documents={documents}
          loading={loading}
          error={error}
          onDelete={handleDeleteDocument}
          onDownload={downloadDocument}
          onPreview={handlePreviewDocument}
        />
      )}

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
          currentFolderId={currentFolderId}
        />
      </Modal>

      {/* Folder Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setEditingFolder(null);
        }}
        title={editingFolder ? 'Klasör Düzenle' : 'Yeni Klasör Oluştur'}
        size="lg"
      >
        <FolderForm
          initialData={editingFolder || undefined}
          categories={categories}
          onSubmit={handleFolderSubmit}
          onCancel={() => {
            setIsFolderModalOpen(false);
            setEditingFolder(null);
          }}
          loading={folderLoading}
        />
      </Modal>

      {/* PDF Preview Modal */}
      {previewDocument && (
        <PDFPreview
          isOpen={isPDFPreviewOpen}
          onClose={handleClosePDFPreview}
          fileUrl={previewUrl}
          fileName={previewDocument.file_name}
          onDownload={() => downloadDocument(previewDocument)}
        />
      )}
    </div>
  );
};