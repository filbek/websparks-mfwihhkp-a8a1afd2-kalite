import React from 'react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { FacilityOverview } from '../components/dashboard/FacilityOverview';
import { NotificationList } from '../components/dashboard/NotificationList';
import { useAuth } from '../contexts/AuthContext';

type Page = 'dashboard' | 'dof-management' | 'event-reporting' | 'document-management' | 'feedback-management' | 'committees' | 'reports' | 'settings' | 'kanban';

interface DashboardProps {
  onPageChange?: (page: Page) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { user } = useAuth();

  // Kalite yöneticisi kontrolü
  const isQualityManager = user?.role.some(r => r === 'sube_kalite' || r === 'merkez_kalite') || false;
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
            <p className="text-primary-100">Anadolu Hastaneleri İntranet Sistemi</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-100">Bugün</p>
            <p className="text-lg font-semibold">{new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Toplam Aktif DÖF"
          value={37}
          icon="bi-clipboard-check"
          trend={{ value: 12, isPositive: false }}
          color="primary"
        />
        <StatsCard
          title="Toplam Aktif Olay"
          value={27}
          icon="bi-exclamation-triangle"
          trend={{ value: 8, isPositive: true }}
          color="warning"
        />
        <StatsCard
          title="Bu Ay Kapatılan"
          value={75}
          icon="bi-check-circle"
          trend={{ value: 15, isPositive: true }}
          color="success"
        />
        <StatsCard
          title="Geciken İşlemler"
          value={5}
          icon="bi-clock"
          trend={{ value: 3, isPositive: false }}
          color="danger"
        />
      </div>

      {/* Bildirimler */}
      <NotificationList onPageChange={onPageChange} />

      {/* Main Content Grid */}
      <div className={`grid grid-cols-1 ${isQualityManager ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
        {/* Recent Activity - Takes 2 columns if quality manager, full width otherwise */}
        <div className={isQualityManager ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <RecentActivity />
        </div>

        {/* Facility Overview - Only for quality managers */}
        {isQualityManager && (
          <div className="lg:col-span-1">
            <FacilityOverview />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <i className="bi bi-plus-lg text-white"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary-900">Yeni DÖF</p>
              <p className="text-sm text-secondary-600">DÖF kaydı oluştur</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-warning-50 hover:bg-warning-100 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-warning-600 rounded-lg flex items-center justify-center">
              <i className="bi bi-exclamation-triangle text-white"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary-900">Olay Bildir</p>
              <p className="text-sm text-secondary-600">Yeni olay kaydı</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-success-50 hover:bg-success-100 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-success-600 rounded-lg flex items-center justify-center">
              <i className="bi bi-bar-chart text-white"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary-900">Raporlar</p>
              <p className="text-sm text-secondary-600">Analiz ve raporlar</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-secondary-600 rounded-lg flex items-center justify-center">
              <i className="bi bi-people text-white"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary-900">Komiteler</p>
              <p className="text-sm text-secondary-600">Komite yönetimi</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
