import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { User, Facility } from '../../types';
import {
  exportUsersToExcel,
  generateImportTemplate,
  parseImportFile,
  generatePasswordsForImport,
  exportPasswordsToExcel,
  ImportedUserWithPassword,
  UserImportData
} from '../../utils/userImportExport';
import { supabase } from '../../lib/supabase';

interface UserImportExportProps {
  users: User[];
  facilities: Facility[];
  onImportComplete: () => void;
}

export const UserImportExport: React.FC<UserImportExportProps> = ({
  users,
  facilities,
  onImportComplete
}) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedUsers, setParsedUsers] = useState<UserImportData[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStep, setImportStep] = useState<'select' | 'preview' | 'importing' | 'complete'>('select');
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
    usersWithPasswords?: ImportedUserWithPassword[];
  }>({ success: 0, failed: 0, errors: [] });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportUsers = () => {
    const facilityMap = new Map(facilities.map(f => [f.id, f.name]));
    exportUsersToExcel(users, facilityMap);
  };

  const handleDownloadTemplate = () => {
    generateImportTemplate();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setImportErrors([]);
    setImportWarnings([]);
    setParsedUsers([]);

    try {
      const result = await parseImportFile(file);

      if (!result.success) {
        setImportErrors(result.errors);
        setImportWarnings(result.warnings);
        setImportStep('select');
      } else {
        setParsedUsers(result.data || []);
        setImportWarnings(result.warnings);
        setImportStep('preview');
      }
    } catch (error) {
      setImportErrors([error instanceof Error ? error.message : 'Dosya işleme hatası']);
      setImportStep('select');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportUsers = async () => {
    setIsProcessing(true);
    setImportStep('importing');

    const usersWithPasswords = generatePasswordsForImport(parsedUsers);
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
      usersWithPasswords: [] as ImportedUserWithPassword[]
    };

    for (const userWithPassword of usersWithPasswords) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userWithPassword.email,
          password: userWithPassword.generatedPassword,
          options: {
            emailRedirectTo: undefined,
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Kullanıcı oluşturulamadı');

        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: userWithPassword.email,
            display_name: userWithPassword.display_name,
            role: [userWithPassword.role],
            facility_id: userWithPassword.facility_id,
            department_name: userWithPassword.department_name,
            is_active: userWithPassword.is_active,
          });

        if (insertError) throw insertError;

        results.success++;
        results.usersWithPasswords.push(userWithPassword);
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: userWithPassword.email,
          error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        });
      }
    }

    setImportResults(results);
    setImportStep('complete');
    setIsProcessing(false);

    if (results.success > 0) {
      onImportComplete();
    }
  };

  const handleDownloadPasswords = () => {
    if (importResults.usersWithPasswords && importResults.usersWithPasswords.length > 0) {
      exportPasswordsToExcel(importResults.usersWithPasswords);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setParsedUsers([]);
    setImportErrors([]);
    setImportWarnings([]);
    setImportStep('select');
    setImportResults({ success: 0, failed: 0, errors: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseModal = () => {
    setIsImportModalOpen(false);
    resetImport();
  };

  const getFacilityName = (facilityId: number) => {
    return facilities.find(f => f.id === facilityId)?.name || `Şube #${facilityId}`;
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={handleExportUsers}
        variant="outline"
        className="border-primary-300 text-primary-700 hover:bg-primary-50"
      >
        <i className="bi bi-download mr-2"></i>
        Kullanıcıları Dışa Aktar
      </Button>

      <Button
        onClick={() => setIsImportModalOpen(true)}
        variant="outline"
        className="border-success-300 text-success-700 hover:bg-success-50"
      >
        <i className="bi bi-upload mr-2"></i>
        Kullanıcıları İçe Aktar
      </Button>

      <Button
        onClick={handleDownloadTemplate}
        variant="outline"
        className="border-secondary-300 text-secondary-700 hover:bg-secondary-50"
      >
        <i className="bi bi-file-earmark-spreadsheet mr-2"></i>
        Şablon İndir
      </Button>

      <Modal
        isOpen={isImportModalOpen}
        onClose={handleCloseModal}
        title="Kullanıcıları İçe Aktar"
        size="xl"
      >
        <div className="space-y-6">
          {importStep === 'select' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <i className="bi bi-info-circle text-blue-600 text-xl mr-3 mt-0.5"></i>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">İçe aktarma talimatları:</p>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Önce "Şablon İndir" butonuna tıklayarak örnek dosyayı indirin</li>
                      <li>Excel dosyasını açın ve kullanıcı bilgilerini girin</li>
                      <li>Geçerli rol değerleri: personel, sube_kalite, merkez_kalite, admin</li>
                      <li>Şube ID'lerinin sistemde mevcut olduğundan emin olun</li>
                      <li>Her kullanıcı için otomatik güvenli şifre oluşturulacaktır</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center">
                <i className="bi bi-cloud-upload text-4xl text-secondary-400 mb-3"></i>
                <p className="text-secondary-700 mb-4">Excel dosyasını seçin</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    as="span"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <i className="bi bi-folder2-open mr-2"></i>
                    Dosya Seç
                  </Button>
                </label>
                {selectedFile && (
                  <p className="text-sm text-secondary-600 mt-3">
                    Seçili dosya: {selectedFile.name}
                  </p>
                )}
              </div>

              {importErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <i className="bi bi-exclamation-triangle text-red-600 text-xl mr-3 mt-0.5"></i>
                    <div className="flex-1">
                      <p className="font-medium text-red-800 mb-2">Hatalar tespit edildi:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {importErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {importStep === 'preview' && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <i className="bi bi-check-circle text-green-600 text-xl mr-3"></i>
                  <div>
                    <p className="font-medium text-green-800">
                      {parsedUsers.length} kullanıcı içe aktarılmaya hazır
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Her kullanıcı için otomatik güvenli şifre oluşturulacak
                    </p>
                  </div>
                </div>
              </div>

              {importWarnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <i className="bi bi-exclamation-circle text-yellow-600 text-xl mr-3 mt-0.5"></i>
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800 mb-2">Uyarılar:</p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {importWarnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-h-96 overflow-auto border border-secondary-200 rounded-lg">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">
                        E-posta
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">
                        Ad Soyad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">
                        Şube
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {parsedUsers.map((user, index) => (
                      <tr key={index} className="hover:bg-secondary-50">
                        <td className="px-4 py-3 text-sm text-secondary-900">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-secondary-900">{user.display_name}</td>
                        <td className="px-4 py-3 text-sm text-secondary-700">{user.role}</td>
                        <td className="px-4 py-3 text-sm text-secondary-700">
                          {getFacilityName(user.facility_id)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={resetImport}>
                  <i className="bi bi-arrow-left mr-2"></i>
                  Geri
                </Button>
                <Button
                  onClick={handleImportUsers}
                  className="bg-success-600 hover:bg-success-700"
                >
                  <i className="bi bi-check-lg mr-2"></i>
                  İçe Aktar ({parsedUsers.length} kullanıcı)
                </Button>
              </div>
            </>
          )}

          {importStep === 'importing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-secondary-900">Kullanıcılar içe aktarılıyor...</p>
              <p className="text-sm text-secondary-600 mt-2">Bu işlem birkaç dakika sürebilir</p>
            </div>
          )}

          {importStep === 'complete' && (
            <>
              <div className={`border rounded-lg p-6 ${
                importResults.failed === 0
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start">
                  <i className={`text-3xl mr-4 ${
                    importResults.failed === 0
                      ? 'bi bi-check-circle text-green-600'
                      : 'bi bi-exclamation-triangle text-yellow-600'
                  }`}></i>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">İçe aktarma tamamlandı</h3>
                    <div className="space-y-2 text-sm">
                      <p>✓ Başarılı: <strong>{importResults.success}</strong> kullanıcı</p>
                      {importResults.failed > 0 && (
                        <p>✗ Başarısız: <strong>{importResults.failed}</strong> kullanıcı</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {importResults.success > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <i className="bi bi-shield-lock text-blue-600 text-xl mr-3 mt-0.5"></i>
                    <div className="flex-1">
                      <p className="font-medium text-blue-800 mb-2">Şifreler oluşturuldu</p>
                      <p className="text-sm text-blue-700 mb-3">
                        Kullanıcılar için güvenli şifreler otomatik oluşturuldu. Şifreleri indirmek için aşağıdaki butona tıklayın.
                      </p>
                      <Button
                        onClick={handleDownloadPasswords}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <i className="bi bi-download mr-2"></i>
                        Şifreleri İndir (Excel)
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <i className="bi bi-exclamation-triangle text-red-600 text-xl mr-3 mt-0.5"></i>
                    <div className="flex-1">
                      <p className="font-medium text-red-800 mb-2">Hatalar:</p>
                      <div className="max-h-48 overflow-auto">
                        <ul className="text-sm text-red-700 space-y-1">
                          {importResults.errors.map((error, index) => (
                            <li key={index}>• <strong>{error.email}:</strong> {error.error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  onClick={handleCloseModal}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Kapat
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
