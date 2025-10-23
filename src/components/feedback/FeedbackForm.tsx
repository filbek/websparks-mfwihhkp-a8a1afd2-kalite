import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { FeedbackFormData, FeedbackCategory } from '../../types/feedback';
import { validateFeedbackForm } from '../../utils/validation';

interface FeedbackFormProps {
  categories: FeedbackCategory[];
  onSubmit: (data: FeedbackFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: Partial<FeedbackFormData>;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  categories,
  onSubmit,
  onCancel,
  loading = false,
  initialValues = {}
}) => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    title: initialValues.title || '',
    content: initialValues.content || '',
    category_id: initialValues.category_id || '',
    priority: initialValues.priority || 'orta',
    is_anonymous: initialValues.is_anonymous || false,
    reporter_name: initialValues.reporter_name || '',
    reporter_email: initialValues.reporter_email || '',
    reporter_phone: initialValues.reporter_phone || '',
    tags: initialValues.tags || []
  });

  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon
    const validation = validateFeedbackForm(formData);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    
    // Form hatalarını temizle
    setFormErrors({});

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form gönderim hatası:', error);
    }
  };

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const priorityOptions = [
    { value: 'düşük', label: 'Düşük' },
    { value: 'orta', label: 'Orta' },
    { value: 'yüksek', label: 'Yüksek' },
    { value: 'kritik', label: 'Kritik' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Başlık"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Görüş başlığını girin"
          required
        />
      </div>

      <div>
        <Textarea
          label="İçerik"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="Görüşünüzü detaylı bir şekilde açıklayın..."
          rows={5}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label="Kategori"
            name="category_id"
            value={formData.category_id}
            onChange={handleSelectChange}
            options={categoryOptions}
            required
          />
        </div>

        <div>
          <Select
            label="Öncelik"
            name="priority"
            value={formData.priority}
            onChange={handleSelectChange}
            options={priorityOptions}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Etiketler
        </label>
        <div className="flex space-x-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            placeholder="Etiket ekleyin ve Enter'a basın"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
          >
            Ekle
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-secondary-100 text-secondary-800"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-secondary-600 hover:text-secondary-800"
                >
                  <i className="bi bi-times"></i>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-secondary-200 pt-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_anonymous"
            name="is_anonymous"
            checked={formData.is_anonymous}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
          />
          <label htmlFor="is_anonymous" className="ml-2 block text-sm text-secondary-900">
            Anonim olarak gönder
          </label>
        </div>
        <p className="mt-1 text-sm text-secondary-500">
          Anonim gönderim seçeneğinde kimliğiniz gizlenecektir.
        </p>
      </div>

      {formData.is_anonymous && (
        <div className="border-t border-secondary-200 pt-4 bg-secondary-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-secondary-900 mb-3">
            İletişim Bilgileri (Anonim gönderim için zorunlu)
          </h3>
          <div className="space-y-4">
            <Input
              label="Adınız"
              name="reporter_name"
              value={formData.reporter_name}
              onChange={handleInputChange}
              placeholder="Adınızı girin"
              required={formData.is_anonymous}
            />

            <Input
              label="E-posta"
              name="reporter_email"
              type="email"
              value={formData.reporter_email}
              onChange={handleInputChange}
              placeholder="E-posta adresiniz"
            />

            <Input
              label="Telefon"
              name="reporter_phone"
              value={formData.reporter_phone}
              onChange={handleInputChange}
              placeholder="Telefon numaranız"
            />
            
            <p className="text-xs text-secondary-500">
              E-posta veya telefon numaranızdan en az birini girmeniz gerekmektedir.
            </p>
          </div>
        </div>
      )}

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
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gönderiliyor...
            </>
          ) : (
            'Gönder'
          )}
        </Button>
      </div>
    </form>
  );
};