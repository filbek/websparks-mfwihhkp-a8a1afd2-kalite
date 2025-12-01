import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Event } from '../../types/events';
import { eventClassifications, eventLocations, eventTypes, departments, jobTitles } from '../../data/eventData';
import { useEventAttachments } from '../../hooks/useEventAttachments';
import { useAuth } from '../../contexts/AuthContext';

interface PatientSafetyFormProps {
  onSubmit: (data: Partial<Event>) => Promise<Event | undefined>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Event;
}

export const PatientSafetyForm: React.FC<PatientSafetyFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData
}) => {
  const { uploadFiles, uploading } = useEventAttachments();
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialData ? {
    event_type: initialData.event_type || 'hasta_guvenlik' as const,
    privacy_request: initialData.privacy_request || false,
    working_department: initialData.working_department || '',
    patient_type: initialData.patient_type || '',
    patient_number: initialData.patient_number || '',
    gender: initialData.gender || '',
    affected_person_name: initialData.affected_person_name || '',
    birth_date: initialData.birth_date || '',
    admission_date: initialData.admission_date || '',
    reporter_name: initialData.reporter_name || '',
    event_date: initialData.event_date || new Date().toISOString().split('T')[0],
    event_time: initialData.event_time || new Date().toTimeString().slice(0, 5),
    repeat_count: initialData.repeat_count || 1,
    score: initialData.score || 0,
    event_class: initialData.event_class || 'hasta_guvenlik',
    main_category: initialData.main_category || '',
    sub_category: initialData.sub_category || '',
    location: initialData.location || '',
    event_category: initialData.event_category || '',
    responsible_profession: initialData.responsible_profession || '',
    event_details: initialData.event_details || '',
    suggestions: initialData.suggestions || '',
    is_medication_error: initialData.is_medication_error || false,
    medication_name: initialData.medication_name || '',
    quality_note: initialData.quality_note || '',
    manager_evaluation: initialData.manager_evaluation || '',
    ministry_integration: initialData.ministry_integration || false,
    hss_code: initialData.hss_code || ''
  } : {
    event_type: 'hasta_guvenlik' as const,
    privacy_request: false,
    working_department: '',
    patient_type: '',
    patient_number: '',
    gender: '',
    affected_person_name: '',
    birth_date: '',
    admission_date: '',
    reporter_name: '',
    event_date: new Date().toISOString().split('T')[0],
    event_time: new Date().toTimeString().slice(0, 5),
    repeat_count: 1,
    score: 0,
    event_class: 'hasta_guvenlik',
    main_category: '',
    sub_category: '',
    location: '',
    event_category: '',
    responsible_profession: '',
    event_details: '',
    suggestions: '',
    is_medication_error: false,
    medication_name: '',
    quality_note: '',
    manager_evaluation: '',
    ministry_integration: false,
    hss_code: ''
  });

  // Update reporter info when user data is available
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

    if (!formData.patient_type) newErrors.patient_type = 'Hasta tipi seçiniz';
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
          alert('Olay kaydedildi ancak dosyalar y\u00fcklenirken bir hata olu\u015ftu.');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Olay kaydedilemedi. L\u00fctfen tekrar deneyin.');
    }
  };

  // Get filtered options based on selections
  const patientSafetyClass = eventClassifications.find(c => c.id === 'hasta_guvenlik');
  const mainCategories = patientSafetyClass?.main_categories || [];
  const selectedMainCategory = mainCategories.find(m => m.id === formData.main_category);
  const subCategories = selectedMainCategory?.sub_categories || [];

  const departmentOptions = [
    { value: '', label: 'Bölüm Seçiniz' },
    ...departments.map(d => ({ value: d.id, label: d.name }))
  ];

  const patientTypeOptions = [
    { value: '', label: 'Hasta Tipi Seçiniz' },
    { value: 'yatan_hasta', label: 'Yatan Hasta' },
    { value: 'ayaktan_hasta', label: 'Ayaktan Hasta' },
    { value: 'ziyaretci', label: 'Ziyaretçi' },
    { value: 'refakatci', label: 'Refakatçi' }
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

  // Dynamic event category options based on score
  const getEventCategoryOptions = () => {
    const score = formData.score;
    let categoryLabel = '';

    if (score === 0) {
      categoryLabel = 'Ramak Kala';
    } else if (score === 1) {
      categoryLabel = 'Zararla Sonuçlanmayan Olay';
    } else if (score >= 2 && score <= 4) {
      categoryLabel = 'İstenmeyen Olay (Advers Event)';
    } else if (score >= 5) {
      categoryLabel = 'Sentinel Olay';
    }

    return [
      { value: categoryLabel.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, ''), label: categoryLabel }
    ];
  };

  const eventCategoryOptions = getEventCategoryOptions();

  const jobTitleOptions = [
    { value: '', label: 'Meslek Seçiniz' },
    ...jobTitles.map(j => ({ value: j.id, label: j.name }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-danger-600 to-danger-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Hasta Güvenliği Olay Bildirimi</h1>
            <p className="text-danger-100">Hasta güvenliği ile ilgili olayları bildirin</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i className="bi bi-shield-exclamation text-2xl"></i>
          </div>
        </div>
      </div>

      <form className="space-y-6">
        {/* Hasta Bilgileri */}
        <Card>
          <CardContent className="space-y-4">
            {/* Gizlilik Talebi */}
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
                    onChange={() => {
                      setFormData({
                        ...formData,
                        privacy_request: false,
                        reporter_name: user?.display_name || '',
                        working_department: user?.department_name || ''
                      });
                    }}
                    className="mr-2 h-4 w-4 text-danger-600 focus:ring-danger-500"
                  />
                  Hayır
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
                    className="mr-2 h-4 w-4 text-danger-600 focus:ring-danger-500"
                  />
                  Evet
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Çalıştığı Bölüm"
                value={formData.working_department}
                disabled
                className="bg-secondary-50"
              />

              <Select
                label="Hasta Tipi *"
                value={formData.patient_type}
                onChange={(e) => setFormData({ ...formData, patient_type: e.target.value })}
                options={patientTypeOptions}
                error={errors.patient_type}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Hasta Numarası"
                value={formData.patient_number}
                onChange={(e) => setFormData({ ...formData, patient_number: e.target.value })}
                placeholder="2395439"
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Cinsiyet
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="erkek"
                      checked={formData.gender === 'erkek'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="mr-2 h-4 w-4 text-danger-600 focus:ring-danger-500"
                    />
                    Erkek
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="kadin"
                      checked={formData.gender === 'kadin'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="mr-2 h-4 w-4 text-danger-600 focus:ring-danger-500"
                    />
                    Kadın
                  </label>
                </div>
              </div>
            </div>

            <Input
              label="Olaydan Etkilenenin Adı Soyadı"
              value={formData.affected_person_name}
              onChange={(e) => setFormData({ ...formData, affected_person_name: e.target.value })}
              placeholder="Olaydan Etkilenenin Adı Soyadı"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Doğum Tarihi"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />

              <Input
                label="Yatış Tarihi"
                type="date"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Olay Giriş Tarihi"
                value={new Date().toLocaleDateString('tr-TR')}
                disabled
                className="bg-secondary-50"
              />

              <Input
                label="Olayı Bildiren Adı Soyadı"
                value={formData.reporter_name}
                disabled
                className="bg-secondary-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Olay Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">⚠️</span> Olay Bilgileri
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
                label="Olay Gerçekleşme Sayısı"
                type="number"
                min="1"
                value={formData.repeat_count}
                onChange={(e) => setFormData({ ...formData, repeat_count: parseInt(e.target.value) || 1 })}
              />
            </div>

            {/* Score Slider */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
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
                    categoryValue = 'zararla_sonuçlanmayan_olay';
                  } else if (score >= 2 && score <= 4) {
                    categoryValue = 'istenmeyen_olay_advers_event';
                  } else if (score >= 5) {
                    categoryValue = 'sentinel_olay';
                  }

                  setFormData({ ...formData, score: newScore, event_category: categoryValue });
                }}
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
                label="Olay Tipi *"
                value={formData.event_category}
                onChange={(e) => setFormData({ ...formData, event_category: e.target.value })}
                options={eventCategoryOptions}
                error={errors.event_category}
                disabled
                className="bg-secondary-50"
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Sentinel Olay
                </label>
                <div className="flex items-center h-10 px-3 rounded-lg border border-secondary-300 bg-secondary-50">
                  <span className="text-secondary-700">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Gerçekleştiği Yer *"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                options={locationOptions}
                error={errors.location}
              />

              <Select
                label="Hatayı Yapanın Mesleği"
                value={formData.responsible_profession}
                onChange={(e) => setFormData({ ...formData, responsible_profession: e.target.value })}
                options={jobTitleOptions}
              />
            </div>

            <div>
              <Input
                label="HSS Kodu"
                value={formData.hss_code}
                onChange={(e) => setFormData({ ...formData, hss_code: e.target.value })}
                placeholder="Örnek: HPL.HM.Z1.0"
              />
              <p className="text-xs text-secondary-500 mt-1">
                HSS kodunu manuel olarak giriniz
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ek Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">📋</span> Ek Bilgiler
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

            {/* Medication Error */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  İlaç Hatası mı?
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_medication_error}
                    onChange={(e) => setFormData({ ...formData, is_medication_error: e.target.checked })}
                    className="mr-2 h-4 w-4 text-danger-600 focus:ring-danger-500 rounded"
                  />
                  <span className="text-sm text-secondary-600">Bu olay bir ilaç hatası</span>
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

            {/* File Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-secondary-700">
                Dosya Ekleri
              </label>
              <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 hover:border-danger-400 transition-colors">
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
                  <i className="bi bi-cloud-upload text-4xl text-secondary-400 mb-2"></i>
                  <p className="text-sm text-secondary-600 mb-2">
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
                  <p className="text-xs text-secondary-500 mt-2">
                    Desteklenen formatlar: JPG, PNG, PDF, Word, Excel (Max 10MB)
                  </p>
                </div>
              </div>

              {/* Attached Files List */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-secondary-700">
                    Eklenen Dosyalar ({attachedFiles.length})
                  </p>
                  <div className="space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-200"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <i className="bi bi-file-earmark text-xl text-secondary-500"></i>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-secondary-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachedFiles(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="text-danger-600 hover:text-danger-700 p-1"
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

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Entegrasyon
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.ministry_integration}
                  onChange={(e) => setFormData({ ...formData, ministry_integration: e.target.checked })}
                  className="mr-2 h-4 w-4 text-danger-600 focus:ring-danger-500 rounded"
                />
                <span className="text-sm text-secondary-600">Bakanlık Entegrasyonu Yapıldı</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
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
              className="bg-danger-600 hover:bg-danger-700 text-white w-full sm:w-auto"
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
