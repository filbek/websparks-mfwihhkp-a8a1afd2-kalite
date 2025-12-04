/*
  # Yatış ve Taburculuk İşlemleri & Ücretlendirme ve Faturalama Hizmetleri Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  İki kategori için Excel'den alınan güncel kısa açıklamaları yükler:
  - Yatış ve Taburculuk İşlemleri: 14 açıklama
  - Ücretlendirme ve Faturalama Hizmetleri: 9 açıklama
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni açıklamaları ekler
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value IN ('yatis_ve_taburculuk_islemleri', 'ucretlendirme_ve_faturalama_hizmetleri');

-- Yatış ve Taburculuk İşlemleri kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('yatis_ve_taburculuk_islemleri', 'yatis_yanlis_kat', 'Hastanın yatış için yanlış kata yönlendirilmesi', 1, true),
  ('yatis_ve_taburculuk_islemleri', 'cikis_teyit_yok', 'Çıkış işlemi teyit edilmeden hastanın gönderilmesi', 2, true),
  ('yatis_ve_taburculuk_islemleri', 'cikis_uzun_sure', 'Çıkış işlemlerinin uzun sürmesi (Sigorta onayı hariç)', 3, true),
  ('yatis_ve_taburculuk_islemleri', 'onaysiz_yonlendirme', 'Hastaya onay vermeden uygulama alanına yönlendirilmesi', 4, true),
  ('yatis_ve_taburculuk_islemleri', 'oda_rezervasyon_aksaklik', 'Oda rezervasyonunda aksaklık', 5, true),
  ('yatis_ve_taburculuk_islemleri', 'hasta_bilgi_eksik', 'Randevu, kontrol, ilaç bilgisi gibi konularda hastaya eksik bilgi verilmesi', 6, true),
  ('yatis_ve_taburculuk_islemleri', 'sigorta_onay_gec', 'Sigorta yatış – çıkış onayının gecikmesi', 7, true),
  ('yatis_ve_taburculuk_islemleri', 'sigorta_odeme_onay_yok', 'Sigortanın ödeme onayı vermemesi', 8, true),
  ('yatis_ve_taburculuk_islemleri', 'taburculuk_aksar_yeni_hasta_yok', 'Tabuculuk sürecinin aksamasından dolayı yeni hastanın yatırılamaması', 9, true),
  ('yatis_ve_taburculuk_islemleri', 'taburculuk_egitim_yok', 'Taburculuk eğitiminin yapılmaması veya belgelenmemesi', 10, true),
  ('yatis_ve_taburculuk_islemleri', 'oda_izolasyon_uygun_degil', 'Uygun olmayan oda/izolasyon önlemiyle hasta yatışı', 11, true),
  ('yatis_ve_taburculuk_islemleri', 'yatis_uzun_bekleme', 'Yatış aşamasında uzun süreli bekleme (Sigorta onayı hariç)', 12, true),
  ('yatis_ve_taburculuk_islemleri', 'yatis_dosya_eksik', 'Yatış dosyasında eksiklik (evrak,imza vb.) olması', 13, true),
  ('yatis_ve_taburculuk_islemleri', 'yatis_rehberlik_yetersiz', 'Yatış işlemleri sırasında hasta ve yakınlarına yeterli rehberlik sağlanmaması', 14, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Ücretlendirme ve Faturalama Hizmetleri kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('ucretlendirme_ve_faturalama_hizmetleri', 'ayrintili_fatura_yok', 'Ayrıntılı fatura verilmemesi', 1, true),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'fiyat_farkli_cagri_banko', 'Çağrı merkezinden verilen fiyatla bankodan alınan fiyatın farklı olması', 2, true),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'fiyat_bilgi_yok', 'Fiyat bilgisi verilmemesi / alınamaması', 3, true),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'hastaneler_ucret_fark', 'Hastaneler arası ücret farklılığının olması', 4, true),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'iade_aksar', 'İade sürecinin aksaması nedeniyle hasta şikayeti', 5, true),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'kurum_anlaşma_ucret_fazla', 'Kurumundan yararlanamadığı ya da anlaşma şartlarından fazla ücret alındığı düşüncesi', 6, true),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'oss_anlasma_aksaklik', 'ÖSS ve anlaşmalı kurumlarla ilgili aksaklık', 7, true),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'ucret_itiraz', 'Ücrete itiraz edilmesi', 8, true),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'ucret_yuksek', 'Ücretlerin yüksek olması', 9, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
