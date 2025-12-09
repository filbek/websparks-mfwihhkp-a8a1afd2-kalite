import React from 'react';
import { DatabaseSetup } from '../components/admin/DatabaseSetup';

export const DatabaseSetupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors">
      <div className="flex">
        <div className="hidden lg:block w-64 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 transition-colors">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              <a
                href="/database-setup"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-600 dark:border-primary-500"
              >
                <i className="bi bi-database text-lg"></i>
                <span className="font-medium">Veritabanı Kurulumu</span>
              </a>
              <a
                href="/feedback-management"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left text-secondary-700 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700"
              >
                <i className="bi bi-chat-dots text-lg"></i>
                <span className="font-medium">Görüş-Öneri</span>
              </a>
            </nav>
          </div>
        </div>

        <main className="flex-1 p-6 lg:p-8">
          <DatabaseSetup />
        </main>
      </div>
    </div>
  );
};