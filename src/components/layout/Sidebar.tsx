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

import { useTheme } from '../../contexts/ThemeContext';

export const Sidebar: React.FC<SidebarProps> = ({ className, currentPage, onPageChange }) => {
  const { user, hasRole, logout, currentOrganization } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();

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
    <aside className={cn('w-64 glass border-r h-full flex flex-col transition-all duration-300', className)}>
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b border-secondary-200 dark:border-secondary-800">
        {currentOrganization?.logo_url ? (
          <img
            src={currentOrganization.logo_url}
            alt={currentOrganization.name}
            className="max-h-28 max-w-[85%] w-auto object-contain"
          />
        ) : (
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <i className="bi bi-hospital text-white text-2xl"></i>
          </div>
        )}
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-3 bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary-300 dark:bg-secondary-700 rounded-full flex items-center justify-center">
              <i className="bi bi-person-fill text-secondary-600 dark:text-secondary-400 text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">{user.display_name}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">{user.role.join(', ')}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors"
              title={theme === 'light' ? 'Gece Moduna Geç' : 'Gündüz Moduna Geç'}
            >
              {theme === 'light' ? (
                <i className="bi bi-moon-stars text-lg"></i>
              ) : (
                <i className="bi bi-sun text-lg"></i>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-secondary-500 dark:text-secondary-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Çıkış Yap"
            >
              <i className="bi bi-box-arrow-right text-lg"></i>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-6">
        <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-400 mb-4">Menü</h3>
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left',
                currentPage === item.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-600'
                  : 'text-secondary-700 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800'
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
      <div className="p-4 border-t border-secondary-200 dark:border-secondary-800">
        <div className="flex items-center justify-center space-x-2 text-xs text-secondary-500 dark:text-secondary-400">
          <span>© 2025 - 2026</span>
          <span>•</span>
          <span>Powered by</span>
          <span className="font-semibold text-primary-600 dark:text-primary-500">Bekir Filizdağ</span>
        </div>
      </div>
    </aside>
  );
};
