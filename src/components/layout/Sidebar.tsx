import React from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

type Page = 'dashboard' | 'dof-management' | 'event-reporting' | 'document-management' | 'feedback-management' | 'committees' | 'reports' | 'settings';

interface SidebarProps {
  className?: string;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, currentPage, onPageChange }) => {
  const { user } = useAuth();
  
  const menuItems = [
    { id: 'dashboard' as Page, icon: 'bi-speedometer2', label: 'Dashboard' },
    { id: 'dof-management' as Page, icon: 'bi-clipboard-check', label: 'DÖF Yönetimi' },
    { id: 'event-reporting' as Page, icon: 'bi-exclamation-triangle', label: 'Olay Bildirimi' },
    { id: 'document-management' as Page, icon: 'bi-file-earmark-text', label: 'Doküman Yönetimi' },
    { id: 'feedback-management' as Page, icon: 'bi-chat-dots', label: 'Görüş-Öneri' },
    { id: 'committees' as Page, icon: 'bi-people', label: 'Komiteler' },
    { id: 'reports' as Page, icon: 'bi-bar-chart', label: 'Raporlar' },
    { id: 'settings' as Page, icon: 'bi-gear', label: 'Ayarlar' }
  ];

  return (
    <aside className={cn('w-64 bg-white border-r border-secondary-200 h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center space-x-3 px-6 py-4 border-b border-secondary-200">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <i className="bi bi-hospital text-white text-xl"></i>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-secondary-900">Anadolu Hastaneleri</h2>
          <p className="text-xs text-secondary-500">Kalite Yönetim Sistemi</p>
        </div>
      </div>
      
      {/* User Info */}
      {user && (
        <div className="px-6 py-3 bg-secondary-50 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary-300 rounded-full flex items-center justify-center">
              <i className="bi bi-person-fill text-secondary-600 text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">{user.display_name}</p>
              <p className="text-xs text-secondary-500 truncate">{user.role.join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-6">
        <h3 className="text-sm font-semibold text-secondary-900 mb-4">Menü</h3>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left',
                currentPage === item.id 
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' 
                  : 'text-secondary-700 hover:bg-secondary-50'
              )}
            >
              <i className={`bi ${item.icon} text-lg`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-center justify-center space-x-2 text-xs text-secondary-500">
          <span>© 2024</span>
          <span>•</span>
          <span>Powered by</span>
          <span className="font-semibold text-primary-600">Websparks AI</span>
        </div>
      </div>
    </aside>
  );
};
