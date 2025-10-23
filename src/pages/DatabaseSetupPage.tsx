import React from 'react';
import { DatabaseSetup } from '../components/admin/DatabaseSetup';

export const DatabaseSetupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="flex">
        <div className="hidden lg:block w-64 bg-white border-r border-secondary-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              <a
                href="/database-setup"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left bg-primary-50 text-primary-700 border-r-2 border-primary-600"
              >
                <i className="bi bi-database text-lg"></i>
                <span className="font-medium">Veritabanı Kurulumu</span>
              </a>
              <a
                href="/feedback-management"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left text-secondary-700 hover:bg-secondary-50"
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