import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DOFManagement } from './pages/DOFManagement';
import { EventReporting } from './pages/EventReporting';
import { DocumentManagement } from './pages/DocumentManagement';
import { FeedbackManagement } from './pages/FeedbackManagement';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { UnderConstruction } from './pages/UnderConstruction';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type Page = 'dashboard' | 'dof-management' | 'event-reporting' | 'document-management' | 'feedback-management' | 'committees' | 'reports' | 'settings';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

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
      case 'committees':
        return <UnderConstruction title="Komiteler" description="Komite yönetimi modülü şu anda geliştirilme aşamasındadır. Yakında komite toplantılarını, üyeleri ve kararları yönetebileceksiniz." />;
      case 'reports':
        return <UnderConstruction title="Raporlar" description="Raporlama modülü şu anda geliştirilme aşamasındadır. Yakında detaylı analiz ve raporlara erişebileceksiniz." />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-white rounded-lg shadow-lg border border-secondary-200 hover:bg-secondary-50 transition-colors"
          >
            <i className={`bi ${isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'} text-xl text-secondary-700`}></i>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div className="flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>

          {/* Mobile Sidebar */}
          <div
            className={`lg:hidden fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar
              currentPage={currentPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                setIsMobileMenuOpen(false);
              }}
            />
          </div>

          <main className="flex-1 p-6 lg:p-8 pt-20 lg:pt-6">
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
                <span>© 2025 Anadolu Hastaneleri. Tüm hakları saklıdır.</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary-600 mt-2 sm:mt-0">
                <span>Powered by</span>
                <span className="font-semibold text-primary-600">Bekir Filizdağ</span>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
