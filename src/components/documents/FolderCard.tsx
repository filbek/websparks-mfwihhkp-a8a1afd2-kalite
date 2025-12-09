import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { DocumentFolder } from '../../types/documents';

interface FolderCardProps {
  folder: DocumentFolder;
  onOpen: (folder: DocumentFolder) => void;
  onEdit?: (folder: DocumentFolder) => void;
  onDelete?: (folderId: string) => void;
  showActions?: boolean;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onOpen,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(folder);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(folder.id);
  };

  return (
    <Card
      className="p-4 hover:shadow-lg transition-all cursor-pointer relative group"
      onClick={() => onOpen(folder)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            <i className="bi bi-folder-fill text-3xl text-secondary-900 dark:text-primary-400"></i>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-secondary-900 dark:text-white truncate">
              {folder.name}
            </h3>

            {folder.description && (
              <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400 line-clamp-2">
                {folder.description}
              </p>
            )}

            <div className="mt-2 flex items-center space-x-3 text-xs text-secondary-500 dark:text-secondary-400">
              {(folder.document_count ?? 0) > 0 && (
                <span className="flex items-center">
                  <i className="bi bi-file-earmark mr-1"></i>
                  {folder.document_count}
                </span>
              )}
              {(folder.subfolder_count ?? 0) > 0 && (
                <span className="flex items-center">
                  <i className="bi bi-folder mr-1"></i>
                  {folder.subfolder_count}
                </span>
              )}
            </div>
          </div>
        </div>

        {showActions && (onEdit || onDelete) && (
          <div className="relative ml-2">
            <button
              onClick={handleMenuToggle}
              className="p-1 hover:bg-secondary-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <i className="bi bi-three-dots-vertical text-secondary-600"></i>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 z-20 py-1">
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 flex items-center"
                    >
                      <i className="bi bi-pencil mr-2"></i>
                      Düzenle
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 flex items-center"
                    >
                      <i className="bi bi-trash mr-2"></i>
                      Sil
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
