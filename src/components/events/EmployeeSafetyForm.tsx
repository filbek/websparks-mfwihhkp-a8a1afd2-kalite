import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Event } from '../../types/events';
import {
  eventClassifications,
  eventLocations,
  eventTypes,
  departments,
  jobTitles,
  damageStatuses,
  impactDurations,
  facilityLocations,
  facilitySubLocations,
  employeeSafetyClasses,
  primaryCauseDetails
} from '../../data/eventData';
import { useEventAttachments } from '../../hooks/useEventAttachments';
import { useAuth } from '../../contexts/AuthContext';

interface EmployeeSafetyFormProps {
  onSubmit: (data: Partial<Event>) => Promise<Event | undefined>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Event;
}

export const EmployeeSafetyForm: React.FC<EmployeeSafetyFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData
}) => {
  const { uploadFiles, uploading } = useEventAttachments();
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialData ? {
    event_type: initialData.event_type || 'calisan_guvenlik' as const,
    privacy_request: initialData.privacy_request || false,
    working_department: initialData.working_department || '',
    affected_person_name: initialData.affected_person_name || '',
    reporter_name: initialData.reporter_name || '',
    event_date: initialData.event_date || new Date().toISOString().split('T')[0],
    event_time: initialData.event_time || new Date().toTimeString().slice(0, 5),
    repeat_count: initialData.repeat_count || 1,
    score: initialData.score || 0,
    event_class: initialData.event_class || 'calisan_guvenlik',
    main_category: initialData.main_category || '',
    sub_category: initialData.sub_category || '',
    location: initialData.location || '',
    event_category: initialData.event_category || '',
    event_details: initialData.event_details || '',
    suggestions: initialData.suggestions || '',
    is_medication_error: initialData.is_medication_error || false,
    medication_name: initialData.medication_name || '',
    quality_note: initialData.quality_note || '',
    manager_evaluation: initialData.manager_evaluation || '',
    ministry_integration: initialData.ministry_integration || false,
    job_title: initialData.job_title || '',
    damage_status: initialData.damage_status || '',
    impact_duration: initialData.impact_duration || '',
    legal_action_status: initialData.legal_action_status || '',
    facility_location: initialData.facility_location || '',
    facility_sub_location: initialData.facility_sub_location || '',
    event_class_detail: initialData.event_class_detail || '',
    primary_cause_detail: initialData.primary_cause_detail || '',
    unwanted_event_reported: initialData.unwanted_event_reported || false,
    work_accident_reported: initialData.work_accident_reported || false,
    white_code_initiated: initialData.white_code_initiated || false
  } : {
    event_type: 'calisan_guvenlik' as const,
    privacy_request: false,
    working_department: '',
    affected_person_name: '',
    reporter_name: '',
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
    legal_action_status: '',
    facility_location: '',
    facility_sub_location: '',
    event_class_detail: '',
    primary_cause_detail: '',
    unwanted_event_reported: false,
    work_accident_reported: false,
    white_code_initiated: false
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => {
        if (!prev.privacy_request && !prev.reporter_name) {
          return {
            ...prev,
            reporter_name: user.display_name || '',
            working_department: user.department_name || ''
          };
        }
        return prev;
      });
    }
  }, [user]);

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.job_title) newErrors.job_title = 'Çalışanın görevi seçiniz';
    if (!formData.damage_status) newErrors.damage_status = 'Gerçekleşme/Zarar verme durumu seçiniz';
    if (!formData.impact_duration) newErrors.impact_duration = 'Etki süresi seçiniz';
    if (!formData.event_date) newErrors.event_date = 'Olay tarihi gereklidir';
    if (!formData.event_time) newErrors.event_time = 'Olay saati gereklidir';
    if (!formData.facility_location) newErrors.facility_location = 'Olayın gerçekleştiği kurum seçiniz';
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
      const eventData = {
        ...formData,
        status,
        facility_id: 1,
        reporter_id: 'current-user-id'
      };

      const createdEvent = await onSubmit(eventData);

      if (createdEvent && attachedFiles.length > 0 && eventData.status !== 'taslak') {
        try {
          await uploadFiles(createdEvent.id, attachedFiles);
          console.log('Files uploaded successfully for event:', createdEvent.id);
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          alert('Olay kaydedildi ancak dosyalar yüklenirken bir hata oluştu.');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Olay kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  const employeeSafetyClass = eventClassifications.find(c => c.id === 'calisan_guvenlik');
  const mainCategories = employeeSafetyClass?.main_categories || [];
  const selectedMainCategory = mainCategories.find(m => m.id === formData.main_category);
  const subCategories = selectedMainCategory?.sub_categories || [];

  const filteredPrimaryCauses = primaryCauseDetails.filter(
    p => p.parent === formData.main_category || p.parent === 'all'
  );

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

  const facilityLocationOptions = [
    { value: '', label: 'Kurum Seçiniz' },
    ...facilityLocations.map(f => ({ value: f.id, label: f.name }))
  ];

  const facilitySubLocationOptions = [
    { value: '', label: 'Kurum Alt Kırılım Seçiniz' },
    ...facilitySubLocations.map(f => ({ value: f.id, label: f.name }))
  ];

  const employeeSafetyClassOptions = [
    { value: '', label: 'Olay Sınıfı Seçiniz' },
    ...employeeSafetyClasses.map(e => ({ value: e.id, label: e.name }))
  ];

  const mainCategoryOptions = [
    { value: '', label: 'Ana Başlık Seçiniz' },
    ...mainCategories.map(m => ({ value: m.id, label: m.name }))
  ];

  const subCategoryOptions = [
    { value: '', label: 'Alt Başlık Seçiniz' },
    ...subCategories.map(s => ({ value: s.id, label: s.name }))
  ];

  const primaryCauseOptions = [
    { value: '', label: 'Öncelikli Sebep Seçiniz' },
    ...filteredPrimaryCauses.map(p => ({ value: p.id, label: p.name }))
  ];

  const locationOptions = [
    { value: '', label: 'Yer Seçiniz' },
    ...eventLocations.map(l => ({ value: l.id, label: l.name }))
  ];

  const getEventCategoryOptions = () => {
    const score = formData.score;
    let categoryLabel = '';

    if (score === 0) {
      categoryLabel = 'Ramak Kala';
    } else if (score === 1) {
      categoryLabel = 'Zarar Yok';
    } else if (score >= 2 && score <= 4) {
      categoryLabel = 'Hafif Zarar';
    } else if (score >= 5) {
      categoryLabel = 'Ciddi Zarar';
    }

    return [
      { value: categoryLabel.toLowerCase().replace(/\s+/g, '_'), label: categoryLabel }
    ];
  };

  const eventCategoryOptions = getEventCategoryOptions();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Çalışan Güvenliği Olay Bildirimi</h1>
            <p className="text-orange-100">Çalışan güvenliği ile ilgili olayları bildirin</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i className="bi bi-person-exclamation text-2xl"></i>
          </div>
        </div>
      </div>

      <form className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
                Gizlilik Talebi *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy_request"
                    checked={!formData.privacy_request}
                    onChange={() => {
                      setFormData({
                        ...formData,
                        privacy_request: false,
                        reporter_name: user?.display_name || '',
                        working_department: user?.department_name || ''
                      });
                    }}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="dark:text-secondary-300">Hayır</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy_request"
                    checked={formData.privacy_request}
                    onChange={() => {
                      setFormData({
                        ...formData,
                        privacy_request: true,
                        reporter_name: '',
                        working_department: ''
                      });
                    }}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="dark:text-secondary-300">Evet</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Çalıştığı Bölüm"
                value={formData.working_department}
                disabled
                className="bg-secondary-50 dark:bg-secondary-700/50"
              />

              <Select
                label="Çalışanın Görevi *"
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
                placeholder="Çalışan Adı Soyadı"
              />

              <Input
                label="Olay Giriş Tarihi"
                value={new Date().toLocaleDateString('tr-TR')}
                disabled
                className="bg-secondary-50 dark:bg-secondary-700/50"
              />
            </div>

            <Input
              label="Olayı Bildiren Adı Soyadı"
              value={formData.reporter_name}
              disabled
              className="bg-secondary-50 dark:bg-secondary-700/50"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary-900 dark:text-white">
              <span className="text-xl">🏥</span> Kurum Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Olayın Gerçekleştiği Kurum *"
                value={formData.facility_location}
                onChange={(e) => setFormData({ ...formData, facility_location: e.target.value })}
                options={facilityLocationOptions}
                error={errors.facility_location}
              />

              <Select
                label="Olayın Gerçekleştiği Kurum Alt Kırılım"
                value={formData.facility_sub_location}
                onChange={(e) => setFormData({ ...formData, facility_sub_location: e.target.value })}
                options={facilitySubLocationOptions}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary-900 dark:text-white">
              <span className="text-xl">👤</span> Çalışan Güvenliği Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Gerçekleşme/Zarar Verme Durumu *"
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

            <Select
              label="Olay Sınıfı"
              value={formData.event_class_detail}
              onChange={(e) => setFormData({ ...formData, event_class_detail: e.target.value })}
              options={employeeSafetyClassOptions}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary-900 dark:text-white">
              <span className="text-xl">⚠️</span> Olay Detayları
            </CardTitle>
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

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Olay Puanı (0-7): {formData.score}
              </label>
              <input
                type="range"
                min="0"
                max="7"
                value={formData.score}
                onChange={(e) => {
                  const newScore = parseInt(e.target.value);
                  const score = newScore;
                  let categoryValue = '';

                  if (score === 0) {
                    categoryValue = 'ramak_kala';
                  } else if (score === 1) {
                    categoryValue = 'zarar_yok';
                  } else if (score >= 2 && score <= 4) {
                    categoryValue = 'hafif_zarar';
                  } else if (score >= 5) {
                    categoryValue = 'ciddi_zarar';
                  }

                  setFormData({ ...formData, score: newScore, event_category: categoryValue });
                }}
                className="w-full h-2 bg-secondary-200 dark:bg-secondary-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-secondary-500 dark:text-secondary-400 mt-1">
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
                label="Olay Tipi *"
                value={formData.event_category}
                onChange={(e) => setFormData({ ...formData, event_category: e.target.value })}
                options={eventCategoryOptions}
                error={errors.event_category}
                disabled
                className="bg-secondary-50 dark:bg-secondary-700/50"
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Sentinel Olay
                </label>
                <div className="flex items-center h-10 px-3 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700/50">
                  <span className="text-secondary-700 dark:text-secondary-300">
                    {formData.score >= 5 ? 'Evet' : 'Hayır'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Olay Ana Başlığı *"
                value={formData.main_category}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    main_category: e.target.value,
                    sub_category: '',
                    primary_cause_detail: ''
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Gerçekleştiği Yer *"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                options={locationOptions}
                error={errors.location}
              />

              <Select
                label="Olayın Öncelikli Sebebi Alt Kırılım"
                value={formData.primary_cause_detail}
                onChange={(e) => setFormData({ ...formData, primary_cause_detail: e.target.value })}
                options={primaryCauseOptions}
                disabled={!formData.main_category}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary-900 dark:text-white">
              <span className="text-xl">📋</span> Bildirim ve İşlem Durumları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                İstenmeyen Olay Bildirimi
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="unwanted_event_reported"
                    checked={formData.unwanted_event_reported}
                    onChange={() => setFormData({ ...formData, unwanted_event_reported: true })}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="dark:text-secondary-300">Yapıldı</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="unwanted_event_reported"
                    checked={!formData.unwanted_event_reported}
                    onChange={() => setFormData({ ...formData, unwanted_event_reported: false })}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="dark:text-secondary-300">Yapılmadı</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Hukuki İşlem
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="legal_action_status"
                    checked={formData.legal_action_status === 'baslatildi'}
                    onChange={() => setFormData({ ...formData, legal_action_status: 'baslatildi' })}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="dark:text-secondary-300">Başlatıldı</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="legal_action_status"
                    checked={formData.legal_action_status === 'baslatilmadi'}
                    onChange={() => setFormData({ ...formData, legal_action_status: 'baslatilmadi' })}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="dark:text-secondary-300">Başlatılmadı</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                İş Kazası Bildirimi
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="work_accident_reported"
                    checked={formData.work_accident_reported}
                    onChange={() => setFormData({ ...formData, work_accident_reported: true })}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="dark:text-secondary-300">Yapıldı</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="work_accident_reported"
                    checked={!formData.work_accident_reported}
                    onChange={() => setFormData({ ...formData, work_accident_reported: false })}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="dark:text-secondary-300">Yapılmadı</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Beyaz Kod Süreci
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="white_code_initiated"
                    checked={formData.white_code_initiated}
                    onChange={() => setFormData({ ...formData, white_code_initiated: true })}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="dark:text-secondary-300">Başlatıldı</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="white_code_initiated"
                    checked={!formData.white_code_initiated}
                    onChange={() => setFormData({ ...formData, white_code_initiated: false })}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="dark:text-secondary-300">Başlatılmadı</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary-900 dark:text-white">
              <span className="text-xl">📝</span> Olay Açıklaması
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Olayın Ayrıntıları *"
              value={formData.event_details}
              onChange={(e) => setFormData({ ...formData, event_details: e.target.value })}
              error={errors.event_details}
              placeholder="Olayın detaylı açıklamasını yazın..."
              rows={4}
            />

            <Textarea
              label="Olaya İlişkin Görüş ve Öneriler"
              value={formData.suggestions}
              onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
              placeholder="Benzer olayları önlemek için önerilerinizi yazın..."
              rows={3}
            />

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  İlaç Hatası mı?
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_medication_error}
                    onChange={(e) => setFormData({ ...formData, is_medication_error: e.target.checked })}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 rounded"
                  />
                  <span className="text-sm text-secondary-600 dark:text-secondary-300">Bu olay bir ilaç hatası</span>
                </label>
              </div>

              {formData.is_medication_error && (
                <Input
                  label="İlaç Adı"
                  value={formData.medication_name}
                  onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                  placeholder="İlaç adını yazın..."
                />
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Dosya Ekleri
              </label>
              <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-6 hover:border-orange-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={(e) => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files);
                      setAttachedFiles(prev => [...prev, ...newFiles]);
                    }
                  }}
                  className="hidden"
                />
                <div className="text-center">
                  <i className="bi bi-cloud-upload text-4xl text-secondary-400 dark:text-secondary-500 mb-2"></i>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                    Dosyaları sürükleyip bırakın veya
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm"
                  >
                    <i className="bi bi-paperclip mr-2"></i>
                    Dosya Seç
                  </Button>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                    Desteklenen formatlar: JPG, PNG, PDF, Word, Excel (Max 10MB)
                  </p>
                </div>
              </div>

              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Eklenen Dosyalar ({attachedFiles.length})
                  </p>
                  <div className="space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg border border-secondary-200 dark:border-secondary-600"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <i className="bi bi-file-earmark text-xl text-secondary-500 dark:text-secondary-400"></i>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachedFiles(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="text-orange-600 hover:text-orange-700 p-1"
                        >
                          <i className="bi bi-x-circle text-xl"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Entegrasyon
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.ministry_integration}
                  onChange={(e) => setFormData({ ...formData, ministry_integration: e.target.checked })}
                  className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-secondary-600">Bakanlık Entegrasyonu Yapıldı</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto order-1 sm:order-1"
          >
            Kapat
          </Button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleSubmit('taslak')}
              disabled={loading || uploading}
              className="w-full sm:w-auto"
            >
              Taslak Olarak Sakla
            </Button>

            <Button
              type="button"
              onClick={() => handleSubmit('atanmayi_bekleyen')}
              disabled={loading || uploading}
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
            >
              {loading || uploading ? (
                <>
                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                  {uploading ? 'Dosyalar Yükleniyor...' : 'Gönderiliyor...'}
                </>
              ) : (
                'Kaydet ve Gönder'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
