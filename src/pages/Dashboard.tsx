import React from 'react';
import { Skeleton } from '../components/ui/Skeleton';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { NotificationList } from '../components/dashboard/NotificationList';
import { useDashboardStats } from '../hooks/useDashboardStats';

type Page = 'dashboard' | 'dof-management' | 'event-reporting' | 'document-management' | 'feedback-management' | 'committees' | 'reports' | 'settings' | 'kanban';

interface DashboardProps {
  onPageChange?: (page: Page) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { stats, recentActivities } = useDashboardStats();

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
      {stats.loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Toplam Aktif DÖF"
            value={stats.totalActiveDofs}
            icon="bi-clipboard-check"
            trend={{ value: 12, isPositive: false }}
            color="primary"
          />
          <StatsCard
            title="Toplam Aktif Olay"
            value={stats.totalActiveEvents}
            icon="bi-exclamation-triangle"
            trend={{ value: 8, isPositive: true }}
            color="warning"
          />
          <StatsCard
            title="Bu Ay Kapatılan"
            value={stats.completedThisMonth}
            icon="bi-check-circle"
            trend={{ value: 15, isPositive: true }}
            color="success"
          />
          <StatsCard
            title="Geciken İşlemler"
            value={stats.overdueItems}
            icon="bi-clock"
            trend={{ value: 3, isPositive: false }}
            color="danger"
          />
        </div>
      )}

      {/* Bildirimler */}
      <NotificationList onPageChange={onPageChange} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Activity - Full width */}
        <div>
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 transition-colors">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary-50 dark:bg-primary-900/10 hover:bg-primary-100 dark:hover:bg-primary-900/20 rounded-lg transition-colors border border-transparent dark:border-primary-900/20">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <i className="bi bi-plus-lg text-white"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary-900 dark:text-primary-100">Yeni DÖF</p>
              <p className="text-sm text-secondary-600 dark:text-primary-200/70">DÖF kaydı oluştur</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-warning-50 dark:bg-warning-900/10 hover:bg-warning-100 dark:hover:bg-warning-900/20 rounded-lg transition-colors border border-transparent dark:border-warning-900/20">
            <div className="w-10 h-10 bg-warning-600 rounded-lg flex items-center justify-center">
              <i className="bi bi-exclamation-triangle text-white"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary-900 dark:text-warning-100">Olay Bildir</p>
              <p className="text-sm text-secondary-600 dark:text-warning-200/70">Yeni olay kaydı</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-success-50 dark:bg-success-900/10 hover:bg-success-100 dark:hover:bg-success-900/20 rounded-lg transition-colors border border-transparent dark:border-success-900/20">
            <div className="w-10 h-10 bg-success-600 rounded-lg flex items-center justify-center">
              <i className="bi bi-bar-chart text-white"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary-900 dark:text-success-100">Raporlar</p>
              <p className="text-sm text-secondary-600 dark:text-success-200/70">Analiz ve raporlar</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-secondary-50 dark:bg-secondary-700/50 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors border border-transparent dark:border-secondary-600/20">
            <div className="w-10 h-10 bg-secondary-600 rounded-lg flex items-center justify-center">
              <i className="bi bi-people text-white"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary-900 dark:text-secondary-100">Komiteler</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">Komite yönetimi</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
