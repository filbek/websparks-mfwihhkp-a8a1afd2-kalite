import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Event } from '../../types/events';
import { eventClassifications, eventLocations, eventTypes, departments, jobTitles, damageStatuses, impactDurations } from '../../data/eventData';

interface EmployeeSafetyFormProps {
  onSubmit: (data: Partial<Event>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const EmployeeSafetyForm: React.FC<EmployeeSafetyFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    event_type: 'calisan_guvenlik' as const,
    privacy_request: false,
    department: '',
    affected_person_name: '',
    reporter_name: 'Mevcut Kullanıcı',
    event_date: new Date().toISOString().split('T')[0],
    event_time: new Date().toTimeString().slice(0, 5),
    repeat_count: 1,
    score: 0,
    event_class: 'calisan_guvenlik',
    main_category: '',
    sub_category: '',
    location: '',
    event_category: '',
    event_details: '',
    suggestions: '',
    is_medication_error: false,
    medication_name: '',
    quality_note: '',
    manager_evaluation: '',
    ministry_integration: false,
    job_title: '',
    damage_status: '',
    impact_duration: '',
    legal_action: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill fields when privacy is not requested
  useEffect(() => {
    if (!formData.privacy_request) {
      setFormData(prev => ({
        ...prev,
        department: 'acil_servis',
        affected_person_name: 'Çalışan Adı Soyadı'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        department: '',
        affected_person_name: ''
      }));
    }
  }, [formData.privacy_request]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.job_title) newErrors.job_title = 'Görev/Unvan seçiniz';
    if (!formData.damage_status) newErrors.damage_status = 'Zarar durumu seçiniz';
    if (!formData.impact_duration) newErrors.impact_duration = 'Etki süresi seçiniz';
    if (!formData.event_date) newErrors.event_date = 'Olay tarihi gereklidir';
    if (!formData.event_time) newErrors.event_time = 'Olay saati gereklidir';
    if (!formData.main_category) newErrors.main_category = 'Ana başlık seçiniz';
    if (!formData.sub_category) newErrors.sub_category = 'Alt başlık seçiniz';
    if (!formData.location) newErrors.location = 'Gerçekleştiği yer seçiniz';
    if (!formData.event_category) newErrors.event_category = 'Olay tipi seçiniz';
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
        reporter_id: 'current-user-id'
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Get filtered options based on selections
  const employeeSafetyClass = eventClassifications.find(c => c.id === 'calisan_guvenlik');
  const mainCategories = employeeSafetyClass?.main_categories || [];
  const selectedMainCategory = mainCategories.find(m => m.id === formData.main_category);
  const subCategories = selectedMainCategory?.sub_categories || [];

  const departmentOptions = [
    { value: '', label: 'Bölüm Seçiniz' },
    ...departments.map(d => ({ value: d.id, label: d.name }))
  ];

  const jobTitleOptions = [
    { value: '', label: 'Görev/Unvan Seçiniz' },
    ...jobTitles.map(j => ({ value: j.id, label: j.name }))
  ];

  const damageStatusOptions = [
    { value: '', label: 'Zarar Durumu Seçiniz' },
    ...damageStatuses.map(d => ({ value: d.id, label: d.name }))
  ];

  const impactDurationOptions = [
    { value: '', label: 'Etki Süresi Seçiniz' },
    ...impactDurations.map(i => ({ value: i.id, label: i.name }))
  ];

  const mainCategoryOptions = [
    { value: '', label: 'Ana Başlık Seçiniz' },
    ...mainCategories.map(m => ({ value: m.id, label: m.name }))
  ];

  const subCategoryOptions = [
    { value: '', label: 'Alt Başlık Seçiniz' },
    ...subCategories.map(s => ({ value: s.id, label: s.name }))
  ];

  const locationOptions = [
    { value: '', label: 'Yer Seçiniz' },
    ...eventLocations.map(l => ({ value: l.id, label: l.name }))
  ];

  const eventCategoryOptions = [
    { value: '', label: 'Olay Tipi Seçiniz' },
    ...eventTypes.map(t => ({ value: t.id, label: t.name }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-warning-600 to-warning-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Çalışan Güvenliği Olay Bildirimi</h1>
            <p className="text-warning-100">Çalışan güvenliği ile ilgili olayları bildirin</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i className="bi bi-person-exclamation text-2xl"></i>
          </div>
        </div>
      </div>

      <form className="space-y-6">
        {/* Privacy and Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Privacy Request */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Gizlilik Talebi *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy_request"
                    checked={!formData.privacy_request}
                    onChange={() => setFormData({ ...formData, privacy_request: false })}
                    className="mr-2"
                  />
                  Hayır
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy_request"
                    checked={formData.privacy_request}
                    onChange={() => setFormData({ ...formData, privacy_request: true })}
                    className="mr-2"
                  />
                  Evet
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Çalıştığı Bölüm"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                options={departmentOptions}
                disabled={!formData.privacy_request}
              />

              <Select
                label="Görev/Unvan *"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                options={jobTitleOptions}
                error={errors.job_title}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Olaydan Etkilenenin Adı Soyadı"
                value={formData.affected_person_name}
                onChange={(e) => setFormData({ ...formData, affected_person_name: e.target.value })}
                disabled={!formData.privacy_request}
              />

              <Input
                label="Olay Giriş Tarihi"
                value={new Date().toLocaleDateString('tr-TR')}
                disabled
                className="bg-secondary-50"
              />
            </div>

            <Input
              label="Olayı Bildiren Adı Soyadı"
              value={formData.reporter_name}
              onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
              disabled
              className="bg-secondary-50"
            />
          </CardContent>
        </Card>

        {/* Employee Safety Specific Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Çalışan Güvenliği Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Zarar Durumu *"
                value={formData.damage_status}
                onChange={(e) => setFormData({ ...formData, damage_status: e.target.value })}
                options={damageStatusOptions}
                error={errors.damage_status}
              />

              <Select
                label="Etki Süresi *"
                value={formData.impact_duration}
                onChange={(e) => setFormData({ ...formData, impact_duration: e.target.value })}
                options={impactDurationOptions}
                error={errors.impact_duration}
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.legal_action}
                onChange={(e) => setFormData({ ...formData, legal_action: e.target.checked })}
                className="mr-2"
              />
              Hukuki İşlem Gerekli
            </label>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Olay Detayları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <Input
                label="Olay Tekrar Sayısı"
                type="number"
                min="1"
                value={formData.repeat_count}
                onChange={(e) => setFormData({ ...formData, repeat_count: parseInt(e.target.value) || 1 })}
              />
            </div>

            {/* Score Slider */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Puanlama (0-7): {formData.score}
              </label>
              <input
                type="range"
                min="0"
                max="7"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-secondary-500 mt-1">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Ana Başlık *"
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
                label="Alt Başlık *"
                value={formData.sub_category}
                onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                options={subCategoryOptions}
                error={errors.sub_category}
                disabled={!formData.main_category}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Gerçekleştiği Yer *"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                options={locationOptions}
                error={errors.location}
              />

              <Select
                label="Olay Tipi *"
                value={formData.event_category}
                onChange={(e) => setFormData({ ...formData, event_category: e.target.value })}
                options={eventCategoryOptions}
                error={errors.event_category}
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
              placeholder="Olayın detaylı açıklamasını yazın..."
              rows={4}
            />

            <Textarea
              label="Öneriler"
              value={formData.suggestions}
              onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
              placeholder="Benzer olayları önlemek için önerilerinizi yazın..."
              rows={3}
            />

            {/* Medication Error */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_medication_error}
                  onChange={(e) => setFormData({ ...formData, is_medication_error: e.target.checked })}
                  className="mr-2"
                />
                İlaç Hatası mı?
              </label>

              {formData.is_medication_error && (
                <Input
                  label="İlaç Adı"
                  value={formData.medication_name}
                  onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                  placeholder="İlaç adını yazın..."
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quality and Management Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Değerlendirme Notları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Kalite Notu"
              value={formData.quality_note}
              onChange={(e) => setFormData({ ...formData, quality_note: e.target.value })}
              placeholder="Kalite departmanı notları..."
              rows={3}
            />

            <Textarea
              label="Yönetici Değerlendirme Notu"
              value={formData.manager_evaluation}
              onChange={(e) => setFormData({ ...formData, manager_evaluation: e.target.value })}
              placeholder="Yönetici değerlendirme notları..."
              rows={3}
            />

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.ministry_integration}
                onChange={(e) => setFormData({ ...formData, ministry_integration: e.target.checked })}
                className="mr-2"
              />
              Bakanlık Entegrasyonu Yapıldı
            </label>
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
            Taslak Olarak Sakla
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit('atanmayi_bekleyen')}
            disabled={loading}
            className="bg-warning-600 hover:bg-warning-700"
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
