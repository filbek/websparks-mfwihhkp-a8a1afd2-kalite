import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { FolderFormData, DocumentCategory } from '../../types/documents';

interface FolderFormProps {
  initialData?: Partial<FolderFormData>;
  categories: DocumentCategory[];
  onSubmit: (formData: FolderFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const FolderForm: React.FC<FolderFormProps> = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<FolderFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category_id: initialData?.category_id || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FolderFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category_id: initialData.category_id || ''
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FolderFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Klasör adı gereklidir';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Klasör adı en az 2 karakter olmalıdır';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Klasör adı en fazla 100 karakter olabilir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof FolderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Klasör Adı <span className="text-danger-600">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Örn: 2024 Raporları"
          error={errors.name}
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Açıklama
        </label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Klasör hakkında açıklama ekleyin..."
          rows={3}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Kategori
        </label>
        <Select
          value={formData.category_id || ''}
          onChange={(e) => handleChange('category_id', e.target.value)}
          disabled={loading}
          options={[
            { value: '', label: 'Kategori Seçiniz' },
            ...categories.map((category) => ({
              value: category.id,
              label: category.name
            }))
          ]}
        />
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-secondary-200">
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
          className="bg-primary-600 hover:bg-primary-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Kaydediliyor...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg mr-2"></i>
              {initialData ? 'Güncelle' : 'Oluştur'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
