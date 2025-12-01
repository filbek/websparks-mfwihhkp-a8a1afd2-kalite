import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { User, Facility } from '../../types';
import { CreateUserData, UpdateUserData } from '../../hooks/useUsers';

interface UserFormProps {
  user?: User;
  facilities: Facility[];
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const roleOptions = [
  { value: 'personel', label: 'Personel' },
  { value: 'sube_kalite', label: 'Şube Kalite Yöneticisi' },
  { value: 'merkez_kalite', label: 'Merkez Kalite Yöneticisi' },
  { value: 'admin', label: 'Sistem Yöneticisi' },
];

export const UserForm: React.FC<UserFormProps> = ({
  user,
  facilities,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    display_name: user?.display_name || '',
    role: user?.role[0] || 'personel',
    facility_id: user?.facility_id?.toString() || '',
    department_name: user?.department_name || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!user && !formData.email) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!user && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (!user && formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    }

    if (!formData.display_name) {
      newErrors.display_name = 'Ad Soyad gereklidir';
    }

    if (!formData.facility_id) {
      newErrors.facility_id = 'Şube seçimi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (user) {
        await onSubmit({
          display_name: formData.display_name,
          role: [formData.role],
          facility_id: parseInt(formData.facility_id),
          department_name: formData.department_name || undefined,
        } as UpdateUserData);
      } else {
        await onSubmit({
          email: formData.email,
          password: formData.password,
          display_name: formData.display_name,
          role: [formData.role],
          facility_id: parseInt(formData.facility_id),
          department_name: formData.department_name || undefined,
        } as CreateUserData);
      }
    } catch (error) {
      console.error('Form submit error:', error);
    }
  };

  const facilityOptions = facilities.map(facility => ({
    value: facility.id.toString(),
    label: facility.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!user && (
        <>
          <div>
            <Input
              label="E-posta Adresi"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="kullanici@anadoluhastaneleri.com"
              required
              error={errors.email}
            />
          </div>

          <div>
            <Input
              label="Şifre"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="En az 8 karakter"
              required
              error={errors.password}
            />
            <p className="text-xs text-secondary-500 mt-1">
              Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir.
            </p>
          </div>
        </>
      )}

      <div>
        <Input
          label="Ad Soyad"
          name="display_name"
          value={formData.display_name}
          onChange={handleChange}
          placeholder="Ahmet Yılmaz"
          required
          error={errors.display_name}
        />
      </div>

      <div>
        <Select
          label="Rol"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={roleOptions}
          required
        />
      </div>

      <div>
        <Select
          label="Şube"
          name="facility_id"
          value={formData.facility_id}
          onChange={handleChange}
          options={facilityOptions}
          required
          error={errors.facility_id}
        />
      </div>

      <div>
        <Input
          label="Birim / Departman"
          name="department_name"
          value={formData.department_name}
          onChange={handleChange}
          placeholder="Kalite Yönetimi, Hemşirelik, vb."
        />
        <p className="text-xs text-secondary-500 mt-1">
          Kullanıcının çalıştığı birimi girin (opsiyonel)
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          İptal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {user ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
            </>
          ) : (
            user ? 'Güncelle' : 'Kullanıcı Oluştur'
          )}
        </Button>
      </div>
    </form>
  );
};
