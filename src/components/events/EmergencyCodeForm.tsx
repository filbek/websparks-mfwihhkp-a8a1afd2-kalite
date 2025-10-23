import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Event } from '../../types/events';
import { eventClassifications, eventLocations } from '../../data/eventData';

interface EmergencyCodeFormProps {
  onSubmit: (data: Partial<Event>) => Promise<void>;
  onCancel: () => void;
  onGenerateCode: (eventType: string) => string;
  loading?: boolean;
}

export const EmergencyCodeForm: React.FC<EmergencyCodeFormProps> = ({
  onSubmit,
  onCancel,
  onGenerateCode,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    event_type: 'acil_durum' as const,
    main_category: '',
    sub_category: '',
    location: '',
    event_date: new Date().toISOString().split('T')[0],
    event_time: new Date().toTimeString().slice(0, 5),
    event_code: '',
    event_details: '',
    event_class: 'acil_durum',
    reporter_name: 'Mevcut Kullanıcı'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.main_category) newErrors.main_category = 'Olay ana başlığı seçiniz';
    if (!formData.sub_category) newErrors.sub_category = 'Olay alt başlığı seçiniz';
    if (!formData.location) newErrors.location = 'Gerçekleştiği yer seçiniz';
    if (!formData.event_date) newErrors.event_date = 'Olay tarihi gereklidir';
    if (!formData.event_time) newErrors.event_time = 'Olay saati gereklidir';
    if (!formData.event_details.trim()) newErrors.event_details = 'Olay ayrıntıları gereklidir';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'taslak' | 'atanmayi_bekleyen') => {
    if (status === 'atanmayi_bekleyen' && !validateForm()) return;

    try {
      await onSubmit({
        ...formData,
        status,
        facility_id: 1,
        reporter_id: 'current-user-id',
        privacy_request: false,
        department: 'acil_durum',
        affected_person_name: 'Sistem Geneli',
        repeat_count: 1,
        score: 0,
        event_category: 'acil_durum',
        suggestions: '',
        is_medication_error: false,
        quality_note: '',
        manager_evaluation: '',
        ministry_integration: true
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleGenerateCode = () => {
    const code = onGenerateCode('acil_durum');
    setFormData({ ...formData, event_code: code });
  };

  // Get filtered options based on selections
  const emergencyClass = eventClassifications.find(c => c.id === 'acil_durum');
  const mainCategories = emergencyClass?.main_categories || [];
  const selectedMainCategory = mainCategories.find(m => m.id === formData.main_category);
  const subCategories = selectedMainCategory?.sub_categories || [];

  const mainCategoryOptions = [
    { value: '', label: 'Olay Ana Başlığı Seçiniz' },
    ...mainCategories.map(m => ({ value: m.id, label: m.name }))
  ];

  const subCategoryOptions = [
    { value: '', label: 'Olay Alt Başlığı Seçiniz' },
    ...subCategories.map(s => ({ value: s.id, label: s.name }))
  ];

  const locationOptions = [
    { value: '', label: 'Gerçekleştiği Yer Seçiniz' },
    ...eventLocations.map(l => ({ value: l.id, label: l.name }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Acil Durum Kodları</h1>
            <p className="text-accent-100">Acil durum olaylarını kaydedin ve kod oluşturun</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i className="bi bi-exclamation-triangle-fill text-2xl"></i>
          </div>
        </div>
      </div>

      <form className="space-y-6">
        {/* Event Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Olay Sınıflandırması</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Olay Ana Başlığı *"
                value={formData.main_category}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    main_category: e.target.value,
                    sub_category: ''
                  });
                }}
                options={mainCategoryOptions}
                error={errors.main_category}
              />

              <Select
                label="Olay Alt Başlığı *"
                value={formData.sub_category}
                onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                options={subCategoryOptions}
                error={errors.sub_category}
                disabled={!formData.main_category}
              />
            </div>

            <Select
              label="Gerçekleştiği Yer *"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              options={locationOptions}
              error={errors.location}
            />
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Olay Detayları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Olay Tarihi *"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                error={errors.event_date}
              />

              <Input
                label="Olay Saati *"
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                error={errors.event_time}
              />
            </div>

            {/* Event Code Generation */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-700">
                Olay Kodu
              </label>
              <div className="flex space-x-3">
                <Input
                  value={formData.event_code}
                  disabled
                  className="bg-secondary-50 flex-1"
                  placeholder="Kod oluşturmak için butona tıklayın"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateCode}
                >
                  <i className="bi bi-gear mr-2"></i>
                  Kod Üret
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Olay Sınıfı"
                value="Acil Durum"
                disabled
                className="bg-secondary-50"
              />

              <Input
                label="Olay Giriş Tarihi"
                value={new Date().toLocaleDateString('tr-TR')}
                disabled
                className="bg-secondary-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Description */}
        <Card>
          <CardHeader>
            <CardTitle>Olay Açıklaması</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Olay Ayrıntıları *"
              value={formData.event_details}
              onChange={(e) => setFormData({ ...formData, event_details: e.target.value })}
              error={errors.event_details}
              placeholder="Acil durum olayının detaylı açıklamasını yazın..."
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Kapat
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSubmit('taslak')}
            disabled={loading}
          >
            <i className="bi bi-save mr-2"></i>
            Taslak
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit('atanmayi_bekleyen')}
            disabled={loading}
            className="bg-accent-600 hover:bg-accent-700"
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                Gönderiliyor...
              </>
            ) : (
              <>
                <i className="bi bi-send mr-2"></i>
                Kaydet ve Gönder
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
