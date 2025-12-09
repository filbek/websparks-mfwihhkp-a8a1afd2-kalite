import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { DOF } from '../../types';
import { useDofKaynaklari } from '../../hooks/useDofKaynaklari';
import { useDofKategorileri } from '../../hooks/useDofKategorileri';
import { useDofKisaAciklamalar } from '../../hooks/useDofKisaAciklamalar';
import { useDofLocations } from '../../hooks/useDofLocations';
import { useDofSorumluBolumler } from '../../hooks/useDofSorumluBolumler';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from '../../hooks/useUsers';

interface DOFFormProps {
  dof?: DOF;
  onSubmit: (data: Partial<DOF>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const DOFFormDynamic: React.FC<DOFFormProps> = ({
  dof,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { user } = useAuth();
  const { users: dbUsers, loading: usersLoading } = useUsers();
  const { kaynaklar, loading: kaynakLoading } = useDofKaynaklari();
  const { kategoriler, loading: kategoriLoading } = useDofKategorileri();
  const { locations, loading: locationsLoading } = useDofLocations();
  const { sorumluBolumler, loading: sorumluBolumlerLoading } = useDofSorumluBolumler();

  const [formData, setFormData] = useState({
    tespit_tarihi: dof?.tespit_tarihi || new Date().toISOString().split('T')[0],
    dof_turu: dof?.dof_turu || '',
    tespit_edilen_bolum: dof?.tespit_edilen_yer || '',
    dof_kaynagi: dof?.dof_kaynagi || '',
    dof_kategorisi: dof?.dof_kategorisi || '',
    dof_kisa_aciklama: dof?.kisa_aciklama || '',
    dofu_acan: user?.display_name || '',
    sorumlu_bolum: dof?.sorumlu_bolum || '',
    description: dof?.description || '',
    priority: dof?.priority || 'orta',
    facility_id: dof?.facility_id || user?.facility_id || 1,
    assigned_to: dof?.assigned_to || ''
  });

  const { aciklamalar, loading: aciklamalarLoading } = useDofKisaAciklamalar(
    formData.dof_kategorisi || null
  );

  // Facility based user filtering
  const activeUsers = dbUsers.filter(u =>
    u.is_active &&
    formData.facility_id &&
    (u.facility_id?.toString() === formData.facility_id.toString())
  );

  const assigneeOptions = [
    { value: '', label: 'Atanacak Kişi Seçiniz (İsteğe Bağlı)' },
    ...activeUsers.map(user => ({
      value: user.id,
      label: `${user.display_name} - ${user.department_name || user.role.join(', ')}`
    }))
  ];

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tespit_tarihi) {
      newErrors.tespit_tarihi = 'DÖF Tespit Tarihi gereklidir';
    }

    if (!formData.dof_turu) {
      newErrors.dof_turu = 'DÖF Türü seçiniz';
    }

    if (!formData.tespit_edilen_bolum) {
      newErrors.tespit_edilen_bolum = 'DÖF Tespit Edilen Bölüm/Yer seçiniz';
    }

    if (!formData.dof_kaynagi) {
      newErrors.dof_kaynagi = 'DÖF Kaynağı seçiniz';
    }

    if (!formData.dof_kategorisi) {
      newErrors.dof_kategorisi = 'DÖF Kategorisi seçiniz';
    }

    if (!formData.dof_kisa_aciklama) {
      newErrors.dof_kisa_aciklama = 'DÖF Kısa Açıklama seçiniz';
    }

    if (!formData.sorumlu_bolum) {
      newErrors.sorumlu_bolum = 'DÖF\'den Sorumlu Olan Bölüm seçiniz';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'DÖF Tanım gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const kategoriLabel = kategoriler.find(k => k.value === formData.dof_kategorisi)?.label || '';
      const aciklamaLabel = aciklamalar.find(a => a.value === formData.dof_kisa_aciklama)?.label || '';

      await onSubmit({
        title: `${kategoriLabel} - ${aciklamaLabel}`,
        description: formData.description,
        priority: formData.priority as DOF['priority'],
        dof_turu: formData.dof_turu as DOF['dof_turu'],
        facility_id: formData.facility_id,
        tespit_edilen_yer: formData.tespit_edilen_bolum,
        tespit_tarihi: formData.tespit_tarihi,
        dof_kaynagi: formData.dof_kaynagi,
        dof_kategorisi: formData.dof_kategorisi,
        kisa_aciklama: formData.dof_kisa_aciklama,
        sorumlu_bolum: formData.sorumlu_bolum,
        status: dof?.status || 'taslak',
        assigned_to: formData.assigned_to
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.size <= 100 * 1024 * 1024);

      if (validFiles.length !== files.length) {
        alert('Bazı dosyalar 100MB limiti aşıyor ve eklenemedi.');
      }

      setSelectedFiles(validFiles);
    }
  };

  const dofKaynagiOptions = [
    { value: '', label: 'Kaynak Seçiniz' },
    ...kaynaklar.map(k => ({ value: k.value, label: k.label }))
  ];

  const dofKategorisiOptions = [
    { value: '', label: 'Seçim yapınız' },
    ...kategoriler.map(k => ({
      value: k.value,
      label: k.label
    }))
  ];

  const dofKisaAciklamaOptions = [
    { value: '', label: 'Seçim yapınız' },
    ...aciklamalar.map(a => ({ value: a.value, label: a.label }))
  ];

  const tespitEdilenBolumOptions = [
    { value: '', label: 'Seçim yapınız' },
    ...locations.map(loc => ({ value: loc.value, label: loc.label }))
  ];

  const sorumluBolumOptions = [
    { value: '', label: 'Seçim yapınız' },
    ...sorumluBolumler.map(bolum => ({ value: bolum.value, label: bolum.label }))
  ];

  const dofTuruOptions = [
    { value: '', label: 'DÖF Türü Seçiniz' },
    { value: 'duzeltici', label: 'Düzeltici' },
    { value: 'onleyici', label: 'Önleyici' }
  ];

  const isFormLoading = kaynakLoading || kategoriLoading || locationsLoading || sorumluBolumlerLoading;

  if (isFormLoading) {
    return (
      <div className="bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <i className="bi bi-arrow-clockwise animate-spin text-4xl text-primary-600 mr-3"></i>
          <span className="text-lg text-secondary-600">Form yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-xl text-white px-6 py-5 -mx-6 -mt-6 mb-6">
        <h2 className="text-2xl font-bold mb-1">Yeni DÖF Oluştur</h2>
        <p className="text-primary-100 text-sm">Düzeltici ve Önleyici Faaliyet Formu</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              DÖF Tespit Tarihi
            </label>
            <Input
              type="date"
              value={formData.tespit_tarihi}
              onChange={(e) => setFormData({ ...formData, tespit_tarihi: e.target.value })}
              error={errors.tespit_tarihi}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              DÖF Türü
            </label>
            <Select
              value={formData.dof_turu}
              onChange={(e) => setFormData({ ...formData, dof_turu: e.target.value })}
              options={dofTuruOptions}
              error={errors.dof_turu}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              DÖF Tespit Edilen Bölüm/Yer
            </label>
            <Select
              value={formData.tespit_edilen_bolum}
              onChange={(e) => setFormData({ ...formData, tespit_edilen_bolum: e.target.value })}
              options={tespitEdilenBolumOptions}
              error={errors.tespit_edilen_bolum}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              DÖF Kaynağı
            </label>
            <Select
              value={formData.dof_kaynagi}
              onChange={(e) => setFormData({ ...formData, dof_kaynagi: e.target.value })}
              options={dofKaynagiOptions}
              error={errors.dof_kaynagi}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              DÖF Kategorisi
            </label>
            <Select
              value={formData.dof_kategorisi}
              onChange={(e) => setFormData({
                ...formData,
                dof_kategorisi: e.target.value,
                dof_kisa_aciklama: ''
              })}
              options={dofKategorisiOptions}
              error={errors.dof_kategorisi}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              DÖF Kısa Açıklama
            </label>
            <Select
              value={formData.dof_kisa_aciklama}
              onChange={(e) => setFormData({ ...formData, dof_kisa_aciklama: e.target.value })}
              options={dofKisaAciklamaOptions}
              error={errors.dof_kisa_aciklama}
              disabled={!formData.dof_kategorisi || aciklamalarLoading}
            />
            {aciklamalarLoading && (
              <div className="text-xs text-secondary-500 mt-1">
                <i className="bi bi-arrow-clockwise animate-spin mr-1"></i>
                Yükleniyor...
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              DÖF'ü Açan
            </label>
            <Input
              value={formData.dofu_acan}
              onChange={(e) => setFormData({ ...formData, dofu_acan: e.target.value })}
              disabled
              className="bg-secondary-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              DÖF'den Sorumlu Olan Bölüm
            </label>
            <Select
              value={formData.sorumlu_bolum}
              onChange={(e) => setFormData({ ...formData, sorumlu_bolum: e.target.value })}
              options={sorumluBolumOptions}
              error={errors.sorumlu_bolum}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Atanacak Kişi
            </label>
            <Select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              options={assigneeOptions}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            DÖF Tanım
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
            placeholder="DÖF detaylı açıklamasını girin..."
            rows={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Ekler
          </label>
          <div className="flex items-center space-x-4">
            <label htmlFor="file-upload">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <i className="bi bi-paperclip mr-2"></i>
                Dosya Seç
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
            />
            <span className="text-sm text-secondary-600">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} dosya seçildi`
                : 'Maksimum 100MB/dosya'
              }
            </span>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Seçilen Dosyalar:</h4>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-white rounded border border-secondary-200">
                  <span className="flex items-center text-sm text-secondary-700">
                    <i className="bi bi-file-earmark text-primary-600 mr-2"></i>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                    className="text-danger-600 hover:text-danger-700 transition-colors"
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-secondary-200">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={loading}
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-success-600 hover:bg-success-700 text-white"
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                Kaydediliyor...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg mr-2"></i>
                Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
