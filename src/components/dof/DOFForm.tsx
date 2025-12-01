import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { DOF } from '../../types';
import { useDofLocations } from '../../hooks/useDofLocations';
import { useDofKategorileri } from '../../hooks/useDofKategorileri';
import { useDofKisaAciklamalar } from '../../hooks/useDofKisaAciklamalar';
import { useDofKaynaklari } from '../../hooks/useDofKaynaklari';
import { useDofSorumluBolumler } from '../../hooks/useDofSorumluBolumler';

interface DOFFormProps {
  dof?: DOF;
  onSubmit: (data: Partial<DOF>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const DOFFormUpdated: React.FC<DOFFormProps> = ({
  dof,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { locations, loading: locationsLoading } = useDofLocations();
  const { kategoriler, loading: kategorilerLoading } = useDofKategorileri();
  const { kaynaklari, loading: kaynaklariLoading } = useDofKaynaklari();
  const { sorumluBolumler, loading: sorumluBolumlerLoading } = useDofSorumluBolumler();

  const [formData, setFormData] = useState({
    tespit_tarihi: dof?.created_at ? new Date(dof.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dof_turu: dof?.priority || '',
    tespit_edilen_bolum: dof?.tespit_edilen_yer || '',
    dof_kaynagi: '',
    dof_kategorisi: 'dokuman_yonetimi',
    dof_kisa_aciklama: '',
    dofu_acan: 'Hanife Sena Şahin',
    sorumlu_bolum: '',
    title: dof?.title || '',
    description: dof?.description || '',
    priority: dof?.priority || 'orta',
    facility_id: dof?.facility_id || 1
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { kisaAciklamalar, loading: kisaAciklamalarLoading } = useDofKisaAciklamalar(formData.dof_kategorisi);

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
      await onSubmit({
        title: `${formData.dof_kategorisi} - ${formData.dof_kisa_aciklama}`,
        description: formData.description,
        priority: formData.dof_turu as DOF['priority'],
        facility_id: dof?.facility_id || 1,
        tespit_edilen_yer: formData.tespit_edilen_bolum,
        reporter_id: 'current-user-id',
        status: dof?.status || 'taslak'
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const dofTuruOptions = [
    { value: '', label: 'DÖF Türü Seçiniz' },
    { value: 'duzeltici', label: 'Düzeltici' },
    { value: 'onleyici', label: 'Önleyici' }
  ];

  const tespitEdilenBolumOptions = [
    { value: '', label: 'Seçim yapınız' },
    ...locations.map(loc => ({ value: loc.value, label: loc.label }))
  ];

  const dofKaynagiOptions = [
    { value: '', label: 'Kaynak Seçiniz' },
    ...kaynaklari.map(k => ({ value: k.value, label: k.label }))
  ];

  const dofKategorisiOptions = kategoriler.map(k => ({ value: k.value, label: k.label }));

  const dofKisaAciklamaOptions = [
    { value: '', label: 'Seçim yapınız' },
    ...kisaAciklamalar.map(a => ({ value: a.value, label: a.label }))
  ];

  const sorumluBolumOptions = [
    { value: '', label: 'Seçim yapınız' },
    ...sorumluBolumler.map(b => ({ value: b.value, label: b.label }))
  ];

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
              disabled={!formData.dof_kategorisi || kisaAciklamalarLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            />
            <span className="text-sm text-secondary-600">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} dosya seçildi`
                : 'Maksimum 100MB'
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
                    {file.name}
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
            variant="outline"
            onClick={onCancel}
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
