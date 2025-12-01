import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

type Page = 'dashboard' | 'dof-management' | 'event-reporting' | 'document-management' | 'feedback-management' | 'committees' | 'reports' | 'settings';

interface HeaderProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      await logout();
    }
  };

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: 'bi-speedometer2' },
    { id: 'dof-management' as Page, label: 'DÖF Yönetimi', icon: 'bi-clipboard-check' },
    { id: 'event-reporting' as Page, label: 'Olay Bildirimi', icon: 'bi-exclamation-triangle' },
    { id: 'document-management' as Page, label: 'Doküman Yönetimi', icon: 'bi-file-earmark-text' },
    { id: 'feedback-management' as Page, label: 'Görüş-Öneri', icon: 'bi-chat-dots' },
    { id: 'committees' as Page, label: 'Komiteler', icon: 'bi-people' },
    { id: 'reports' as Page, label: 'Raporlar', icon: 'bi-bar-chart' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-secondary-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <i className="bi bi-hospital text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary-900">Anadolu Hastaneleri</h1>
              <p className="text-xs text-secondary-600">İntranet Sistemi</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`text-secondary-700 hover:text-primary-600 font-medium transition-colors ${
                  currentPage === item.id ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <i className="bi bi-person text-primary-600"></i>
              </div>
              <div className="text-sm">
                <p className="font-medium text-secondary-900">{user?.display_name || 'Kullanıcı'}</p>
                <p className="text-secondary-600">{user?.department_name || 'Şube'}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right mr-2"></i>
              Çıkış
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`bi ${isMobileMenuOpen ? 'bi-x' : 'bi-list'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200 animate-slide-down">
            <nav className="space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentPage === item.id 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-secondary-700 hover:bg-secondary-50'
                  }`}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="pt-3 border-t border-secondary-200">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <i className="bi bi-person text-primary-600"></i>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-secondary-900">{user?.display_name || 'Kullanıcı'}</p>
                    <p className="text-secondary-600">{user?.department_name || 'Şube'}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mx-3 mt-2" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right mr-2"></i>
                  Çıkış
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
