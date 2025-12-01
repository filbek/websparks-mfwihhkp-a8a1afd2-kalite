import React from 'react';

export interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center text-primary-600 hover:text-primary-700 hover:underline transition-colors"
      >
        <i className="bi bi-house-door mr-1"></i>
        <span>Tüm Klasörler</span>
      </button>

      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <i className="bi bi-chevron-right text-secondary-400 text-xs"></i>
          {index === items.length - 1 ? (
            <span className="text-secondary-900 font-medium">{item.name}</span>
          ) : (
            <button
              onClick={() => onNavigate(item.id)}
              className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
            >
              {item.name}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
