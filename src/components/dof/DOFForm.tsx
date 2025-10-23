import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { DOF } from '../../types';

interface DOFFormProps {
  dof?: DOF;
  onSubmit: (data: Partial<DOF>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// Güncellenmiş DÖF Kaynağı seçenekleri
const dofKaynagiOptions = [
  { value: '', label: 'Kaynak Seçiniz' },
  { value: 'oz_degerlendirme_uygunsuslugu', label: 'Öz Değerlendirme Uygunsuzluğu' },
  { value: 'urun_hizmet_surec_uygunsuslugu', label: 'Ürün / Hizmet / Süreç Uygunsuzluğu' },
  { value: 'veri_analiz_sonuclari', label: 'Veri Analiz Sonuçları' },
  { value: 'olay_bildirimleri', label: 'Olay Bildirimleri' },
  { value: 'musteri_sikayeti', label: 'Müşteri Şikayeti' },
  { value: 'saha_denetim_uygunsuslugu', label: 'Saha Denetim Uygunsuzluğu' },
  { value: 'bina_tesis_turu_uygunsuslugu', label: 'Bina Tesis Turu Uygunsuzluğu' }
];

// Kategoriye göre kısa açıklama seçenekleri
const getKisaAciklamaOptions = (kategori: string) => {
  const baseOption = { value: '', label: 'Seçim yapınız' };
  
  switch (kategori) {
    case 'atik_yonetimi':
      return [
        baseOption,
        { value: 'atik_ayirma_eksikligi', label: 'Atık Ayırma Eksikliği' },
        { value: 'atik_depolama_sorunu', label: 'Atık Depolama Sorunu' },
        { value: 'tibbi_atik_yonetimi', label: 'Tıbbi Atık Yönetimi' },
        { value: 'atik_bertaraf_sureci', label: 'Atık Bertaraf Süreci' }
      ];
    case 'cihaz_ve_ekipman':
      return [
        baseOption,
        { value: 'cihaz_ariza', label: 'Cihaz Arızası' },
        { value: 'bakim_eksikligi', label: 'Bakım Eksikliği' },
        { value: 'kalibrasyon_sorunu', label: 'Kalibrasyon Sorunu' },
        { value: 'yedek_parca_eksikligi', label: 'Yedek Parça Eksikliği' }
      ];
    case 'cagri_merkezi_hizmeti':
      return [
        baseOption,
        { value: 'yanit_suresi_uzun', label: 'Yanıt Süresi Uzun' },
        { value: 'bilgi_eksikligi', label: 'Bilgi Eksikliği' },
        { value: 'iletisim_sorunu', label: 'İletişim Sorunu' },
        { value: 'sistem_ariza', label: 'Sistem Arızası' }
      ];
    case 'calisanlarin_tutum_ve_davranislari':
      return [
        baseOption,
        { value: 'iletisim_eksikligi', label: 'İletişim Eksikliği' },
        { value: 'meslek_etigi_ihlali', label: 'Meslek Etiği İhlali' },
        { value: 'hasta_yaklasimi', label: 'Hasta Yaklaşımı' },
        { value: 'ekip_calismasi_sorunu', label: 'Ekip Çalışması Sorunu' }
      ];
    case 'dokuman_yonetimi':
      return [
        baseOption,
        { value: 'prosedur_eksikligi', label: 'Prosedür Eksikliği' },
        { value: 'dokuman_guncelleme', label: 'Doküman Güncelleme' },
        { value: 'erisim_sorunu', label: 'Erişim Sorunu' },
        { value: 'versiyon_kontrolu', label: 'Versiyon Kontrolü' }
      ];
    case 'enfeksiyon_kontrol':
      return [
        baseOption,
        { value: 'el_hijyeni_eksikligi', label: 'El Hijyeni Eksikliği' },
        { value: 'izolasyon_kurallari', label: 'İzolasyon Kuralları' },
        { value: 'sterilizasyon_hatasi', label: 'Sterilizasyon Hatası' },
        { value: 'koruyucu_ekipman', label: 'Koruyucu Ekipman' }
      ];
    case 'gostergelerin_izlenmesi':
      return [
        baseOption,
        { value: 'veri_toplama_eksikligi', label: 'Veri Toplama Eksikliği' },
        { value: 'analiz_yetersizligi', label: 'Analiz Yetersizliği' },
        { value: 'raporlama_gecikme', label: 'Raporlama Gecikme' },
        { value: 'hedef_sapma', label: 'Hedef Sapma' }
      ];
    case 'guvenlik_hizmetleri':
      return [
        baseOption,
        { value: 'giris_cikis_kontrolu', label: 'Giriş Çıkış Kontrolü' },
        { value: 'kamera_sistemi', label: 'Kamera Sistemi' },
        { value: 'alarm_sistemi', label: 'Alarm Sistemi' },
        { value: 'guvenlik_personeli', label: 'Güvenlik Personeli' }
      ];
    case 'hasta_guvenligi':
      return [
        baseOption,
        { value: 'hasta_dusmesi', label: 'Hasta Düşmesi' },
        { value: 'ilac_hatasi', label: 'İlaç Hatası' },
        { value: 'hasta_kimlik_dogrulama', label: 'Hasta Kimlik Doğrulama' },
        { value: 'ameliyat_guvenligi', label: 'Ameliyat Güvenliği' }
      ];
    case 'hasta_guvenligi_mahremiyeti':
      return [
        baseOption,
        { value: 'kisisel_veri_guvenligi', label: 'Kişisel Veri Güvenliği' },
        { value: 'mahremiyet_ihlali', label: 'Mahremiyet İhlali' },
        { value: 'bilgi_paylasimi', label: 'Bilgi Paylaşımı' },
        { value: 'hasta_hakları', label: 'Hasta Hakları' }
      ];
    case 'hasta_mahremiyeti_ve_tibbi_kayitlar':
      return [
        baseOption,
        { value: 'kayit_guvenligi', label: 'Kayıt Güvenliği' },
        { value: 'erisim_yetkisi', label: 'Erişim Yetkisi' },
        { value: 'veri_yedekleme', label: 'Veri Yedekleme' },
        { value: 'hasta_onay_formlari', label: 'Hasta Onay Formları' }
      ];
    case 'hastane_donanimi_ve_fiziksel_sorunlar':
      return [
        baseOption,
        { value: 'bina_bakim', label: 'Bina Bakım' },
        { value: 'havalandirma_sistemi', label: 'Havalandırma Sistemi' },
        { value: 'aydinlatma_sorunu', label: 'Aydınlatma Sorunu' },
        { value: 'su_elektrik_kesintisi', label: 'Su/Elektrik Kesintisi' }
      ];
    case 'hastane_guvenligi':
      return [
        baseOption,
        { value: 'yangin_guvenligi', label: 'Yangın Güvenliği' },
        { value: 'acil_cikis_yollari', label: 'Acil Çıkış Yolları' },
        { value: 'guvenlik_kameralari', label: 'Güvenlik Kameraları' },
        { value: 'ziyaretci_kontrolu', label: 'Ziyaretçi Kontrolü' }
      ];
    case 'ilac_guvenligi':
      return [
        baseOption,
        { value: 'ilac_saklama', label: 'İlaç Saklama' },
        { value: 'son_kullanma_tarihi', label: 'Son Kullanma Tarihi' },
        { value: 'dozaj_hatasi', label: 'Dozaj Hatası' },
        { value: 'ilac_etkilesimi', label: 'İlaç Etkileşimi' }
      ];
    case 'kafeterya_hizmetleri':
      return [
        baseOption,
        { value: 'gida_guvenligi', label: 'Gıda Güvenliği' },
        { value: 'hijyen_kurallari', label: 'Hijyen Kuralları' },
        { value: 'menu_cesitliligi', label: 'Menü Çeşitliliği' },
        { value: 'servis_kalitesi', label: 'Servis Kalitesi' }
      ];
    case 'laboratuvar_ve_radyoloji_hizmetleri':
      return [
        baseOption,
        { value: 'test_sonuc_gecikme', label: 'Test Sonuç Gecikme' },
        { value: 'numune_kaybi', label: 'Numune Kaybı' },
        { value: 'cihaz_kalibrasyon', label: 'Cihaz Kalibrasyon' },
        { value: 'radyasyon_guvenligi', label: 'Radyasyon Güvenliği' }
      ];
    case 'otopark_hizmetleri':
      return [
        baseOption,
        { value: 'park_yeri_yetersizligi', label: 'Park Yeri Yetersizliği' },
        { value: 'guvenlik_sorunu', label: 'Güvenlik Sorunu' },
        { value: 'aydinlatma_eksikligi', label: 'Aydınlatma Eksikliği' },
        { value: 'yonlendirme_tabelasi', label: 'Yönlendirme Tabelası' }
      ];
    case 'personel_yonetimi':
      return [
        baseOption,
        { value: 'egitim_eksikligi', label: 'Eğitim Eksikliği' },
        { value: 'personel_yetersizligi', label: 'Personel Yetersizliği' },
        { value: 'vardiya_planlama', label: 'Vardiya Planlama' },
        { value: 'motivasyon_sorunu', label: 'Motivasyon Sorunu' }
      ];
    case 'randevu_hizmetleri':
      return [
        baseOption,
        { value: 'randevu_sistemi_ariza', label: 'Randevu Sistemi Arızası' },
        { value: 'bekleme_suresi', label: 'Bekleme Süresi' },
        { value: 'randevu_iptali', label: 'Randevu İptali' },
        { value: 'bilgilendirme_eksikligi', label: 'Bilgilendirme Eksikliği' }
      ];
    case 'tani_ve_tedavi_hizmetleri':
      return [
        baseOption,
        { value: 'tani_gecikme', label: 'Tanı Gecikme' },
        { value: 'tedavi_plani', label: 'Tedavi Planı' },
        { value: 'hasta_takip', label: 'Hasta Takip' },
        { value: 'konsultasyon_sureci', label: 'Konsültasyon Süreci' }
      ];
    case 'temizlik_yonetimi':
      return [
        baseOption,
        { value: 'temizlik_standardi', label: 'Temizlik Standardı' },
        { value: 'dezenfeksiyon_eksikligi', label: 'Dezenfeksiyon Eksikliği' },
        { value: 'temizlik_malzemesi', label: 'Temizlik Malzemesi' },
        { value: 'personel_egitimi', label: 'Personel Eğitimi' }
      ];
    case 'ucretlendirme_ve_faturalama_hizmetleri':
      return [
        baseOption,
        { value: 'fatura_hatasi', label: 'Fatura Hatası' },
        { value: 'odeme_sistemi', label: 'Ödeme Sistemi' },
        { value: 'sigorta_islemleri', label: 'Sigorta İşlemleri' },
        { value: 'fiyat_bilgilendirme', label: 'Fiyat Bilgilendirme' }
      ];
    case 'veri_analiz_sonuclari':
      return [
        baseOption,
        { value: 'veri_kalitesi', label: 'Veri Kalitesi' },
        { value: 'analiz_yontemi', label: 'Analiz Yöntemi' },
        { value: 'raporlama_formati', label: 'Raporlama Formatı' },
        { value: 'trend_analizi', label: 'Trend Analizi' }
      ];
    case 'yangin_guvenligi':
      return [
        baseOption,
        { value: 'yangin_alarm_sistemi', label: 'Yangın Alarm Sistemi' },
        { value: 'sondurme_sistemi', label: 'Söndürme Sistemi' },
        { value: 'acil_cikis_isaret', label: 'Acil Çıkış İşaret' },
        { value: 'yangin_tatbikati', label: 'Yangın Tatbikatı' }
      ];
    case 'yatis_ve_taburculuk_islemleri':
      return [
        baseOption,
        { value: 'yatis_sureci', label: 'Yatış Süreci' },
        { value: 'taburcu_planlama', label: 'Taburcu Planlama' },
        { value: 'hasta_bilgilendirme', label: 'Hasta Bilgilendirme' },
        { value: 'evrak_islemleri', label: 'Evrak İşlemleri' }
      ];
    case 'yiyecek_icecek_hizmetleri':
      return [
        baseOption,
        { value: 'diyet_uygunlugu', label: 'Diyet Uygunluğu' },
        { value: 'sicaklik_kontrolu', label: 'Sıcaklık Kontrolü' },
        { value: 'porsiyon_buyuklugu', label: 'Porsiyon Büyüklüğü' },
        { value: 'servis_zamani', label: 'Servis Zamanı' }
      ];
    default:
      return [baseOption];
  }
};

export const DOFForm: React.FC<DOFFormProps> = ({
  dof,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    tespit_tarihi: dof?.created_at ? new Date(dof.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dof_turu: dof?.priority || '',
    tespit_edilen_bolum: dof?.facility_id?.toString() || '',
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
        facility_id: parseInt(formData.tespit_edilen_bolum),
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

  // Dropdown options
  const dofTuruOptions = [
    { value: '', label: 'DÖF Türü Seçiniz' },
    { value: 'düşük', label: 'Düşük' },
    { value: 'orta', label: 'Orta' },
    { value: 'yüksek', label: 'Yüksek' },
    { value: 'kritik', label: 'Kritik' }
  ];

  const tespitEdilenBolumOptions = [
    { value: '', label: 'Seçim yapınız' },
    { value: '1', label: 'Silivri Şubesi' },
    { value: '2', label: 'Avcılar Şubesi' },
    { value: '3', label: 'Ereğli Şubesi' },
    { value: '4', label: 'Acil Servis' },
    { value: '5', label: 'Yoğun Bakım' },
    { value: '6', label: 'Ameliyathane' },
    { value: '7', label: 'Laboratuvar' },
    { value: '8', label: 'Radyoloji' }
  ];

  const dofKategorisiOptions = [
    { value: 'atik_yonetimi', label: 'Atık Yönetimi' },
    { value: 'cihaz_ve_ekipman', label: 'Cihaz ve Ekipman' },
    { value: 'cagri_merkezi_hizmeti', label: 'Çağrı Merkezi Hizmeti' },
    { value: 'calisanlarin_tutum_ve_davranislari', label: 'Çalışanların Tutum ve Davranışları' },
    { value: 'dokuman_yonetimi', label: 'Doküman Yönetimi' },
    { value: 'enfeksiyon_kontrol', label: 'Enfeksiyon Kontrol' },
    { value: 'gostergelerin_izlenmesi', label: 'Göstergelerin İzlenmesi' },
    { value: 'guvenlik_hizmetleri', label: 'Güvenlik Hizmetleri' },
    { value: 'hasta_guvenligi', label: 'Hasta Güvenliği' },
    { value: 'hasta_guvenligi_mahremiyeti', label: 'Hasta Güvenliği / Mahremiyeti' },
    { value: 'hasta_mahremiyeti_ve_tibbi_kayitlar', label: 'Hasta Mahremiyeti ve Tıbbi Kayıtlar' },
    { value: 'hastane_donanimi_ve_fiziksel_sorunlar', label: 'Hastane Donanımı (Oda Dahil) ve Fiziksel Sorunlar' },
    { value: 'hastane_guvenligi', label: 'Hastane Güvenliği' },
    { value: 'ilac_guvenligi', label: 'İlaç Güvenliği' },
    { value: 'kafeterya_hizmetleri', label: 'Kafeterya Hizmetleri' },
    { value: 'laboratuvar_ve_radyoloji_hizmetleri', label: 'Laboratuvar ve Radyoloji Hizmetleri' },
    { value: 'otopark_hizmetleri', label: 'Otopark Hizmetleri' },
    { value: 'personel_yonetimi', label: 'Personel Yönetimi' },
    { value: 'randevu_hizmetleri', label: 'Randevu Hizmetleri' },
    { value: 'tani_ve_tedavi_hizmetleri', label: 'Tanı ve Tedavi Hizmetleri' },
    { value: 'temizlik_yonetimi', label: 'Temizlik Yönetimi' },
    { value: 'ucretlendirme_ve_faturalama_hizmetleri', label: 'Ücretlendirme ve Faturalama Hizmetleri' },
    { value: 'veri_analiz_sonuclari', label: 'Veri Analiz Sonuçları' },
    { value: 'yangin_guvenligi', label: 'Yangın Güvenliği' },
    { value: 'yatis_ve_taburculuk_islemleri', label: 'Yatış ve Taburculuk İşlemleri' },
    { value: 'yiyecek_icecek_hizmetleri', label: 'Yiyecek-İçecek Hizmetleri' }
  ];

  const sorumluBolumOptions = [
    { value: '', label: 'Seçim yapınız' },
    { value: 'kalite_yonetimi', label: 'Kalite Yönetimi' },
    { value: 'hasta_guvenlik', label: 'Hasta Güvenlik' },
    { value: 'enfeksiyon_kontrol', label: 'Enfeksiyon Kontrol' },
    { value: 'teknik_hizmetler', label: 'Teknik Hizmetler' },
    { value: 'insan_kaynaklari', label: 'İnsan Kaynakları' },
    { value: 'tibbi_hizmetler', label: 'Tıbbi Hizmetler' }
  ];

  // Dinamik kısa açıklama seçenekleri
  const dofKisaAciklamaOptions = getKisaAciklamaOptions(formData.dof_kategorisi);

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-primary-600 text-white px-6 py-4 -mx-6 -mt-6 mb-6">
        <h2 className="text-xl font-bold">2.1 Yeni DÖF Oluştur Ekranı</h2>
        <p className="text-primary-100 text-sm mt-1">Yeni DÖF Oluştur</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2 bg-success-100 px-3 py-1 rounded border-2 border-success-400">
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
            <label className="block text-sm font-medium text-secondary-700 mb-2 bg-success-100 px-3 py-1 rounded border-2 border-success-400">
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
            <label className="block text-sm font-medium text-secondary-700 mb-2 bg-success-100 px-3 py-1 rounded border-2 border-success-400">
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

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2 bg-success-100 px-3 py-1 rounded border-2 border-success-400">
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
            <label className="block text-sm font-medium text-secondary-700 mb-2 bg-success-100 px-3 py-1 rounded border-2 border-success-400">
              DÖF Kategorisi
            </label>
            <Select
              value={formData.dof_kategorisi}
              onChange={(e) => setFormData({ 
                ...formData, 
                dof_kategorisi: e.target.value,
                dof_kisa_aciklama: '' // Reset kısa açıklama when category changes
              })}
              options={dofKategorisiOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2 bg-success-100 px-3 py-1 rounded border-2 border-success-400">
              DÖF Kısa Açıklama
            </label>
            <Select
              value={formData.dof_kisa_aciklama}
              onChange={(e) => setFormData({ ...formData, dof_kisa_aciklama: e.target.value })}
              options={dofKisaAciklamaOptions}
              error={errors.dof_kisa_aciklama}
              disabled={!formData.dof_kategorisi}
            />
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2 bg-success-100 px-3 py-1 rounded border-2 border-success-400">```
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
            <label className="block text-sm font-medium text-secondary-700 mb-2 bg-success-100 px-3 py-1 rounded border-2 border-success-400">
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

        {/* DÖF Tanım */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2 bg-success-100 px-3 py-1 rounded border-2 border-success-400 inline-block">
            DÖF Tanım
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
            placeholder="DÖF detaylı açıklamasını girin..."
            rows={6}
            className="mt-2"
          />
        </div>

        {/* File Upload */}
        <div className="flex items-center space-x-4">
          <div className="bg-success-100 px-3 py-2 rounded border-2 border-success-400">
            <label htmlFor="file-upload" className="text-sm font-medium text-secondary-700 cursor-pointer">
              Dosyaları Seç
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <span className="text-sm text-secondary-600">
            {selectedFiles.length > 0 
              ? `${selectedFiles.length} dosya seçildi` 
              : 'Dosya seçilmedi'
            }
          </span>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="bg-secondary-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-secondary-700 mb-2">Seçilen Dosyalar:</h4>
            <ul className="space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between text-sm text-secondary-600">
                  <span className="flex items-center">
                    <i className="bi bi-file-earmark mr-2"></i>
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                    className="text-danger-600 hover:text-danger-700"
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <div className="bg-success-100 px-4 py-2 rounded border-2 border-success-400">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2"
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
```

<websparksAction type="shell">npm install --legacy-peer-deps
