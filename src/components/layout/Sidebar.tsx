import React from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

type Page = 'dashboard' | 'dof-management' | 'event-reporting' | 'document-management' | 'feedback-management' | 'committees' | 'reports' | 'settings' | 'kanban';

interface SidebarProps {
  className?: string;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, currentPage, onPageChange }) => {
  const { user, hasRole, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      await logout();
    }
  };

  const menuItems = [
    { id: 'dashboard' as Page, icon: 'bi-speedometer2', label: 'Dashboard', roles: ['personel', 'sube_kalite', 'merkez_kalite', 'admin'] },
    { id: 'dof-management' as Page, icon: 'bi-clipboard-check', label: 'DÖF Yönetimi', roles: ['personel', 'sube_kalite', 'merkez_kalite', 'admin'] },
    { id: 'event-reporting' as Page, icon: 'bi-exclamation-triangle', label: 'Olay Bildirimi', roles: ['personel', 'sube_kalite', 'merkez_kalite', 'admin'] },
    { id: 'document-management' as Page, icon: 'bi-file-earmark-text', label: 'Doküman Yönetimi', roles: ['personel', 'sube_kalite', 'merkez_kalite', 'admin'] },
    { id: 'feedback-management' as Page, icon: 'bi-chat-dots', label: 'Görüş-Öneri', roles: ['personel', 'sube_kalite', 'merkez_kalite', 'admin'] },
    { id: 'kanban' as Page, icon: 'bi-kanban', label: 'İş Takibi', roles: ['personel', 'sube_kalite', 'merkez_kalite', 'admin'] },
    { id: 'committees' as Page, icon: 'bi-people', label: 'Komiteler', roles: ['personel', 'sube_kalite', 'merkez_kalite', 'admin'] },
    { id: 'reports' as Page, icon: 'bi-bar-chart', label: 'Raporlar', roles: ['sube_kalite', 'merkez_kalite', 'admin'] },
    { id: 'settings' as Page, icon: 'bi-gear', label: 'Ayarlar', roles: ['admin'] }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.some(role => hasRole(role))
  );

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
            <button
              onClick={handleLogout}
              className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Çıkış Yap"
            >
              <i className="bi bi-box-arrow-right text-lg"></i>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-6">
        <h3 className="text-sm font-semibold text-secondary-900 mb-4">Menü</h3>
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => (
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
              {item.id === 'dashboard' && unreadCount > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-primary-600 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-center justify-center space-x-2 text-xs text-secondary-500">
          <span>© 2025 - 2026</span>
          <span>•</span>
          <span>Powered by</span>
          <span className="font-semibold text-primary-600">Bekir Filizdağ</span>
        </div>
      </div>
    </aside>
  );
};
