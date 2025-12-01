import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PasswordResetModal } from './PasswordResetModal';
import { User, Facility } from '../../types';
import { supabase } from '../../lib/supabase';

interface UserListProps {
  users: User[];
  facilities: Facility[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordReset?: (userId: string) => void;
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'danger';
    case 'merkez_kalite':
      return 'warning';
    case 'sube_kalite':
      return 'info';
    default:
      return 'default';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin':
      return 'Sistem Yöneticisi';
    case 'merkez_kalite':
      return 'Merkez Kalite';
    case 'sube_kalite':
      return 'Şube Kalite';
    case 'personel':
      return 'Personel';
    default:
      return role;
  }
};

export const UserList: React.FC<UserListProps> = ({
  users,
  facilities,
  loading,
  onEdit,
  onDelete,
  onPasswordReset,
}) => {
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const getFacilityName = (facilityId: number) => {
    const facility = facilities.find(f => f.id === facilityId);
    return facility?.name || 'Bilinmeyen';
  };

  const handlePasswordResetClick = (user: User) => {
    setSelectedUserForReset(user);
    setIsPasswordResetModalOpen(true);
  };

  const handlePasswordResetConfirm = async (newPassword: string) => {
    if (!selectedUserForReset) return;

    try {
      const { error } = await supabase.auth.admin.updateUserById(
        selectedUserForReset.id,
        { password: newPassword }
      );

      if (error) throw error;

      alert(`${selectedUserForReset.display_name} kullanıcısının şifresi başarıyla sıfırlandı.`);

      if (onPasswordReset) {
        onPasswordReset(selectedUserForReset.id);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      alert(error instanceof Error ? error.message : 'Şifre sıfırlama başarısız oldu');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="bi bi-people text-4xl text-secondary-300 mb-3"></i>
        <p className="text-secondary-600">Henüz kullanıcı bulunmuyor</p>
      </div>
    );
  }

  return (
    <>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-secondary-200">
        <thead className="bg-secondary-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Kullanıcı
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Şube
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Birim
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Durum
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-secondary-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-secondary-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-medium">
                      {user.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-secondary-900">
                      {user.display_name}
                    </div>
                    <div className="text-sm text-secondary-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.role.map((role) => (
                  <Badge key={role} variant={getRoleBadgeVariant(role)} className="mr-1">
                    {getRoleLabel(role)}
                  </Badge>
                ))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                {getFacilityName(user.facility_id)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                {user.department_name || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={user.is_active ? 'success' : 'default'}>
                  {user.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                    title="Kullanıcıyı Düzenle"
                  >
                    <i className="bi bi-pencil mr-1"></i>
                    Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePasswordResetClick(user)}
                    className="text-warning-600 hover:text-warning-700 hover:border-warning-300"
                    title="Şifre Sıfırla"
                  >
                    <i className="bi bi-key mr-1"></i>
                    Şifre
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`${user.display_name} kullanıcısını devre dışı bırakmak istediğinizden emin misiniz?`)) {
                        onDelete(user.id);
                      }
                    }}
                    className="text-danger-600 hover:text-danger-700 hover:border-danger-300"
                    title="Kullanıcıyı Sil"
                  >
                    <i className="bi bi-trash mr-1"></i>
                    Sil
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {selectedUserForReset && (
      <PasswordResetModal
        isOpen={isPasswordResetModalOpen}
        onClose={() => {
          setIsPasswordResetModalOpen(false);
          setSelectedUserForReset(null);
        }}
        userEmail={selectedUserForReset.email}
        userName={selectedUserForReset.display_name}
        onConfirm={handlePasswordResetConfirm}
      />
    )}
    </>
  );
};
