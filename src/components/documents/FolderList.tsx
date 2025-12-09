import React from 'react';
import { FolderCard } from './FolderCard';
import { DocumentFolder } from '../../types/documents';

interface FolderListProps {
  folders: DocumentFolder[];
  loading: boolean;
  error: string | null;
  onFolderOpen: (folder: DocumentFolder) => void;
  onFolderEdit?: (folder: DocumentFolder) => void;
  onFolderDelete?: (folderId: string) => void;
  showActions?: boolean;
}

export const FolderList: React.FC<FolderListProps> = ({
  folders,
  loading,
  error,
  onFolderOpen,
  onFolderEdit,
  onFolderDelete,
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
        <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">Hata Oluştu</h3>
        <p className="text-secondary-600 dark:text-secondary-400">{error}</p>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="bi bi-folder text-4xl text-secondary-400 dark:text-secondary-500"></i>
        </div>
        <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">Klasör Bulunamadı</h3>
        <p className="text-secondary-600 dark:text-secondary-400">Henüz klasör oluşturulmamış.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
          {folders.length} Klasör
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {folders.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            onOpen={onFolderOpen}
            onEdit={onFolderEdit}
            onDelete={onFolderDelete}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  );
};
