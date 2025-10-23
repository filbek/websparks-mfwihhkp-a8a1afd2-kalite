import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { setupFeedbackTables, checkTablesExist } from '../../lib/supabaseAdmin';

export const DatabaseSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; error?: string } | null>(null);
  const [tablesExist, setTablesExist] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkIfTablesExist();
  }, []);

  const checkIfTablesExist = async () => {
    setIsChecking(true);
    try {
      const checkResult = await checkTablesExist();
      setTablesExist(checkResult.exists);
    } catch (error) {
      console.error('Error checking tables:', error);
      setTablesExist(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSetupTables = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const setupResult = await setupFeedbackTables();
      setResult(setupResult);
      
      if (setupResult.success) {
        setTablesExist(true);
      }
    } catch (error) {
      console.error('Error setting up tables:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        error: 'setup_error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Veritabanı Kurulumu</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-3">Durum Kontrolü</h2>
          {isChecking ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span>Tablolar kontrol ediliyor...</span>
            </div>
          ) : tablesExist !== null ? (
            <div className={`p-4 rounded-lg ${tablesExist ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center space-x-2">
                <i className={`bi ${tablesExist ? 'bi-check-circle-fill text-green-600' : 'bi-exclamation-triangle-fill text-yellow-600'}`}></i>
                <span className={`font-medium ${tablesExist ? 'text-green-800' : 'text-yellow-800'}`}>
                  {tablesExist ? 'Feedback tabloları mevcut' : 'Feedback tabloları bulunamadı'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2">
                <i className="bi bi-x-circle-fill text-red-600"></i>
                <span className="font-medium text-red-800">Tablolar kontrol edilemedi</span>
              </div>
            </div>
          )}
        </div>

        {!tablesExist && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-3">Kurulum İşlemleri</h2>
            <p className="text-secondary-600 mb-4">
              Feedback sistemi için gerekli tabloları oluşturmak, indeksleri eklemek, 
              trigger'ları kurmak ve varsayılan verileri eklemek için aşağıdaki butona tıklayın.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <i className="bi bi-check-circle text-green-500"></i>
                <span>Tabloların oluşturulması</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <i className="bi bi-check-circle text-green-500"></i>
                <span>İndekslerin eklenmesi</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <i className="bi bi-check-circle text-green-500"></i>
                <span>Trigger'ların kurulması</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <i className="bi bi-check-circle text-green-500"></i>
                <span>Row Level Security (RLS) politikalarının oluşturulması</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <i className="bi bi-check-circle text-green-500"></i>
                <span>Varsayılan verilerin eklenmesi</span>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className={`mb-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start space-x-2">
              <i className={`bi ${result.success ? 'bi-check-circle-fill text-green-600' : 'bi-x-circle-fill text-red-600'} mt-0.5`}></i>
              <div>
                <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? 'Kurulum Başarılı' : 'Kurulum Hatası'}
                </h3>
                <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          {!tablesExist && (
            <Button
              onClick={handleSetupTables}
              disabled={isLoading}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Kuruluyor...
                </>
              ) : (
                'Tabloları Kur'
              )}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={checkIfTablesExist}
            disabled={isChecking}
          >
            {isChecking ? 'Kontrol Ediliyor...' : 'Durumu Kontrol Et'}
          </Button>
        </div>

        {tablesExist && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <i className="bi bi-info-circle-fill text-blue-600"></i>
              <span className="text-blue-800 font-medium">Sistem Hazır</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Feedback sistemi tabloları başarıyla oluşturuldu. 
              Sistemi kullanmaya başlayabilirsiniz.
            </p>
            <div className="mt-3">
              <Button
                onClick={() => window.location.href = '/feedback-management'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Feedback Sistemine Git
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};