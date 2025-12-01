import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DofSorumluBolum } from '../../hooks/useDofSorumluBolumler';

interface ResponsibleDepartmentModalProps {
  department?: DofSorumluBolum;
  onSubmit: (data: Omit<DofSorumluBolum, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ResponsibleDepartmentModal: React.FC<ResponsibleDepartmentModalProps> = ({
  department,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    label: department?.label || '',
    value: department?.value || '',
    is_active: department?.is_active ?? true,
    display_order: department?.display_order || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!department && formData.label && !formData.value) {
      const generatedValue = formData.label
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      setFormData(prev => ({ ...prev, value: generatedValue }));
    }
  }, [formData.label, department]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Müdürlük adı gereklidir';
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Sistem kodu gereklidir';
    } else if (!/^[a-z0-9_]+$/.test(formData.value)) {
      newErrors.value = 'Sistem kodu sadece küçük harf, rakam ve alt çizgi içerebilir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Müdürlük Adı"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          error={errors.label}
          placeholder="örn: Kalite Müdürlüğü"
          required
        />
        <p className="mt-1 text-xs text-secondary-500">
          Bu isim DÖF formlarında "Sorumlu Bölüm" alanında görünecektir
        </p>
      </div>

      <div>
        <Input
          label="Sistem Kodu"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          error={errors.value}
          placeholder="örn: kalite_md"
          disabled={!!department}
          required
        />
        <p className="mt-1 text-xs text-secondary-500">
          {department
            ? 'Sistem kodu düzenleme sırasında değiştirilemez'
            : 'Otomatik olarak müdürlük adından oluşturulur'}
        </p>
      </div>

      <div>
        <Input
          label="Sıralama"
          type="number"
          value={formData.display_order}
          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
          min="0"
        />
        <p className="mt-1 text-xs text-secondary-500">
          Müdürlüklerin görüntülenme sırasını belirler (küçük sayılar önce gelir)
        </p>
      </div>

      <div className="flex items-center">
        <input
          id="is_active"
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-secondary-700">
          Aktif (DÖF formlarında göster)
        </label>
      </div>

      <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
        <h4 className="text-sm font-medium text-secondary-900 mb-2">Önizleme</h4>
        <div className="text-sm text-secondary-700">
          <p><span className="font-medium">Görünen Ad:</span> {formData.label || '-'}</p>
          <p><span className="font-medium">Sistem Kodu:</span> {formData.value || '-'}</p>
          <p><span className="font-medium">Durum:</span> {formData.is_active ? 'Aktif' : 'Pasif'}</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
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
              <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
              Kaydediliyor...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg mr-2"></i>
              {department ? 'Güncelle' : 'Kaydet'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
