import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DOFManagement } from './pages/DOFManagement';
import { EventReporting } from './pages/EventReporting';
import { DocumentManagement } from './pages/DocumentManagement';
import { FeedbackManagement } from './pages/FeedbackManagement';
import { AuthProvider } from './contexts/AuthContext';

type Page = 'dashboard' | 'dof-management' | 'event-reporting' | 'document-management' | 'feedback-management' | 'committees' | 'reports' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'dof-management':
        return <DOFManagement />;
      case 'event-reporting':
        return <EventReporting />;
      case 'document-management':
        return <DocumentManagement />;
      case 'feedback-management':
        return <FeedbackManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-secondary-50">
        <div className="flex">
          <div className="hidden lg:block">
            <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
          
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {renderPage()}
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-secondary-200 py-4 mt-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <span>© 2024 Anadolu Hastaneleri. Tüm hakları saklıdır.</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary-600 mt-2 sm:mt-0">
                <span>Powered by</span>
                <span className="font-semibold text-primary-600">Websparks AI</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
