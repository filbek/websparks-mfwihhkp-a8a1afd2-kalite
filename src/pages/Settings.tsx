import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { UserList } from '../components/settings/UserList';
import { UserForm } from '../components/settings/UserForm';
import { UserImportExport } from '../components/settings/UserImportExport';
import { DepartmentManagement } from '../components/settings/DepartmentManagement';
import { DepartmentModal } from '../components/settings/DepartmentModal';
import { ResponsibleDepartmentManagement } from '../components/settings/ResponsibleDepartmentManagement';
import { ResponsibleDepartmentModal } from '../components/settings/ResponsibleDepartmentModal';
import { useUsers } from '../hooks/useUsers';
import { useFacilities } from '../hooks/useFacilities';
import { useDofLocations, DofLocation } from '../hooks/useDofLocations';
import { useDofSorumluBolumler, DofSorumluBolum } from '../hooks/useDofSorumluBolumler';
import { useAuth } from '../contexts/AuthContext'; // Added
import { supabase } from '../lib/supabase'; // Added
import { updateOrganization } from '../lib/organizationApi'; // Added
import { User } from '../types';

export const Settings: React.FC = () => {
  const { currentOrganization } = useAuth(); // Added
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'responsible_departments' | 'general'>('users'); // Updated
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isResponsibleDeptModalOpen, setIsResponsibleDeptModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [selectedDepartment, setSelectedDepartment] = useState<DofLocation | undefined>(undefined);
  const [selectedResponsibleDept, setSelectedResponsibleDept] = useState<DofSorumluBolum | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const { users, loading: usersLoading, createUser, updateUser, deleteUser, refetch } = useUsers();
  const { facilities, loading: facilitiesLoading } = useFacilities();
  const {
    addLocation,
    updateLocation,
    deleteLocation,
    toggleActive
  } = useDofLocations(true);

  const {
    addSorumluBolum,
    updateSorumluBolum,
    deleteSorumluBolum,
    toggleActive: toggleActiveResponsible
  } = useDofSorumluBolumler(true);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !currentOrganization) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentOrganization.id}-${Math.random()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    try {
      setLogoUploading(true);

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Update organization
      await updateOrganization(currentOrganization.id, { logo_url: publicUrl });

      // Reload window to reflect changes
      window.location.reload();

    } catch (error) {
      console.error('Logo upload error:', error);
      alert('Logo yüklenirken bir hata oluştu');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCreateUser = async (data: any) => {
    try {
      setFormLoading(true);
      await createUser(data);
      setIsUserModalOpen(false);
      setSelectedUser(undefined);
    } catch (error) {
      console.error('Create user error:', error);
      alert(error instanceof Error ? error.message : 'Kullanıcı oluşturulurken bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return;

    try {
      setFormLoading(true);
      await updateUser(selectedUser.id, data);
      setIsUserModalOpen(false);
      setSelectedUser(undefined);
    } catch (error) {
      console.error('Update user error:', error);
      alert(error instanceof Error ? error.message : 'Kullanıcı güncellenirken bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
    } catch (error) {
      console.error('Delete user error:', error);
      alert(error instanceof Error ? error.message : 'Kullanıcı silinirken bir hata oluştu');
    }
  };

  const handleCloseModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleCreateDepartment = async (data: Omit<DofLocation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setFormLoading(true);
      const { error } = await addLocation(data);
      if (error) throw new Error(error);
      setIsDepartmentModalOpen(false);
      setSelectedDepartment(undefined);
    } catch (error) {
      console.error('Create department error:', error);
      alert(error instanceof Error ? error.message : 'Bölüm eklenirken bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateDepartment = async (data: Omit<DofLocation, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedDepartment) return;

    try {
      setFormLoading(true);
      const { error } = await updateLocation(selectedDepartment.id, data);
      if (error) throw new Error(error);
      setIsDepartmentModalOpen(false);
      setSelectedDepartment(undefined);
    } catch (error) {
      console.error('Update department error:', error);
      alert(error instanceof Error ? error.message : 'Bölüm güncellenirken bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditDepartment = (department: DofLocation) => {
    setSelectedDepartment(department);
    setIsDepartmentModalOpen(true);
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    try {
      const { error } = await deleteLocation(departmentId);
      if (error) throw new Error(error);
    } catch (error) {
      console.error('Delete department error:', error);
      alert(error instanceof Error ? error.message : 'Bölüm silinirken bir hata oluştu');
    }
  };

  const handleToggleActive = async (departmentId: string, isActive: boolean) => {
    try {
      const { error } = await toggleActive(departmentId, isActive);
      if (error) throw new Error(error);
    } catch (error) {
      console.error('Toggle active error:', error);
      alert(error instanceof Error ? error.message : 'Durum değiştirilirken bir hata oluştu');
    }
  };

  const handleCloseDepartmentModal = () => {
    setIsDepartmentModalOpen(false);
    setSelectedDepartment(undefined);
  };

  const handleCreateResponsibleDept = async (data: Omit<DofSorumluBolum, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setFormLoading(true);
      const { error } = await addSorumluBolum(data);
      if (error) throw new Error(error);
      setIsResponsibleDeptModalOpen(false);
      setSelectedResponsibleDept(undefined);
    } catch (error) {
      console.error('Create responsible department error:', error);
      alert(error instanceof Error ? error.message : 'Müdürlük eklenirken bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateResponsibleDept = async (data: Omit<DofSorumluBolum, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedResponsibleDept) return;

    try {
      setFormLoading(true);
      const { error } = await updateSorumluBolum(selectedResponsibleDept.id, data);
      if (error) throw new Error(error);
      setIsResponsibleDeptModalOpen(false);
      setSelectedResponsibleDept(undefined);
    } catch (error) {
      console.error('Update responsible department error:', error);
      alert(error instanceof Error ? error.message : 'Müdürlük güncellenirken bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditResponsibleDept = (department: DofSorumluBolum) => {
    setSelectedResponsibleDept(department);
    setIsResponsibleDeptModalOpen(true);
  };

  const handleDeleteResponsibleDept = async (departmentId: string) => {
    try {
      const { error } = await deleteSorumluBolum(departmentId);
      if (error) throw new Error(error);
    } catch (error) {
      console.error('Delete responsible department error:', error);
      alert(error instanceof Error ? error.message : 'Müdürlük silinirken bir hata oluştu');
    }
  };

  const handleToggleActiveResponsible = async (departmentId: string, isActive: boolean) => {
    try {
      const { error } = await toggleActiveResponsible(departmentId, isActive);
      if (error) throw new Error(error);
    } catch (error) {
      console.error('Toggle active error:', error);
      alert(error instanceof Error ? error.message : 'Durum değiştirilirken bir hata oluştu');
    }
  };

  const handleCloseResponsibleDeptModal = () => {
    setIsResponsibleDeptModalOpen(false);
    setSelectedResponsibleDept(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">Ayarlar</h1>
            <p className="text-secondary-600">Sistem ayarlarını yönetin</p>
          </div>

          <div className="border-b border-secondary-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'general'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
              >
                <i className="bi bi-sliders mr-2"></i>
                Genel Ayarlar
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
              >
                <i className="bi bi-people mr-2"></i>
                Kullanıcı Yönetimi
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'departments'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
              >
                <i className="bi bi-geo-alt mr-2"></i>
                Tespit Edilen Yerler
              </button>
              <button
                onClick={() => setActiveTab('responsible_departments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'responsible_departments'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
              >
                <i className="bi bi-building-gear mr-2"></i>
                Sorumlu Müdürlükler
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* General Settings Tab Content */}
      {activeTab === 'general' ? (
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <div className="flex flex-col space-y-6">
            <div>
              <h2 className="text-xl font-bold text-secondary-900 mb-2">Genel Ayarlar</h2>
              <p className="text-secondary-600">Organizasyon bilgileri ve logo ayarları</p>
            </div>

            <div className="pt-4 border-t border-secondary-200">
              <div className="max-w-xl">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Organizasyon Logosu
                </label>
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-secondary-100 rounded-lg flex items-center justify-center overflow-hidden border border-secondary-200">
                    {currentOrganization?.logo_url ? (
                      <img
                        src={currentOrganization.logo_url}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="bi bi-hospital text-4xl text-secondary-400"></i>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="logo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`inline-flex items-center px-4 py-2 border border-secondary-300 shadow-sm text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 cursor-pointer ${logoUploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      {logoUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-secondary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-upload mr-2"></i>
                          Logo Yükle
                        </>
                      )}
                    </label>
                    <p className="mt-2 text-xs text-secondary-500">
                      PNG, JPG veya GIF. Maksimum 2MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <>
          <div className="bg-white rounded-xl border border-secondary-200 p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-secondary-900 mb-2">Kullanıcılar</h2>
                  <p className="text-secondary-600">Sistem kullanıcılarını yönetin</p>
                </div>

                <Button
                  onClick={() => {
                    setSelectedUser(undefined);
                    setIsUserModalOpen(true);
                  }}
                  className="bg-primary-600 hover:bg-primary-700 mt-4 lg:mt-0"
                >
                  <i className="bi bi-plus-lg mr-2"></i>
                  Yeni Kullanıcı Ekle
                </Button>
              </div>

              <div className="pt-4 border-t border-secondary-200">
                <UserImportExport
                  users={users}
                  facilities={facilities}
                  onImportComplete={refetch}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-secondary-200">
            <UserList
              users={users}
              facilities={facilities}
              loading={usersLoading || facilitiesLoading}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          </div>
        </>
      ) : activeTab === 'departments' ? (
        <>
          <div className="bg-white rounded-xl border border-secondary-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-secondary-900 mb-2">Tespit Edilen Yerler</h2>
                <p className="text-secondary-600">DÖF formlarında "Tespit Edilen Bölüm/Yer" alanında kullanılacak yerleri yönetin</p>
              </div>

              <Button
                onClick={() => {
                  setSelectedDepartment(undefined);
                  setIsDepartmentModalOpen(true);
                }}
                className="bg-primary-600 hover:bg-primary-700 mt-4 lg:mt-0"
              >
                <i className="bi bi-plus-lg mr-2"></i>
                Yeni Yer Ekle
              </Button>
            </div>

            <DepartmentManagement
              onEdit={handleEditDepartment}
              onDelete={handleDeleteDepartment}
              onToggleActive={handleToggleActive}
            />
          </div>
        </>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-secondary-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-secondary-900 mb-2">Sorumlu Müdürlükler</h2>
                <p className="text-secondary-600">DÖF formlarında "Sorumlu Bölüm" alanında kullanılacak müdürlükleri yönetin</p>
              </div>

              <Button
                onClick={() => {
                  setSelectedResponsibleDept(undefined);
                  setIsResponsibleDeptModalOpen(true);
                }}
                className="bg-primary-600 hover:bg-primary-700 mt-4 lg:mt-0"
              >
                <i className="bi bi-plus-lg mr-2"></i>
                Yeni Müdürlük Ekle
              </Button>
            </div>

            <ResponsibleDepartmentManagement
              onEdit={handleEditResponsibleDept}
              onDelete={handleDeleteResponsibleDept}
              onToggleActive={handleToggleActiveResponsible}
            />
          </div>
        </>
      )}

      <Modal
        isOpen={isUserModalOpen}
        onClose={handleCloseModal}
        title={selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
        size="lg"
      >
        <UserForm
          user={selectedUser}
          facilities={facilities}
          onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
          onCancel={handleCloseModal}
          loading={formLoading}
        />
      </Modal>

      <Modal
        isOpen={isDepartmentModalOpen}
        onClose={handleCloseDepartmentModal}
        title={selectedDepartment ? 'Yer Düzenle' : 'Yeni Yer Ekle'}
        size="lg"
      >
        <DepartmentModal
          department={selectedDepartment}
          onSubmit={selectedDepartment ? handleUpdateDepartment : handleCreateDepartment}
          onCancel={handleCloseDepartmentModal}
          loading={formLoading}
        />
      </Modal>

      <Modal
        isOpen={isResponsibleDeptModalOpen}
        onClose={handleCloseResponsibleDeptModal}
        title={selectedResponsibleDept ? 'Müdürlük Düzenle' : 'Yeni Müdürlük Ekle'}
        size="lg"
      >
        <ResponsibleDepartmentModal
          department={selectedResponsibleDept}
          onSubmit={selectedResponsibleDept ? handleUpdateResponsibleDept : handleCreateResponsibleDept}
          onCancel={handleCloseResponsibleDeptModal}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};
