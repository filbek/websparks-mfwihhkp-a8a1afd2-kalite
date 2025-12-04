/*
  # Kafeterya Hizmetleri & Güvenlik Hizmetleri Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  İki kategori için Excel'den alınan güncel kısa açıklamaları yükler:
  - Kafeterya Hizmetleri: 17 açıklama
  - Güvenlik Hizmetleri: 9 açıklama
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni açıklamaları ekler
  
  ## Not
  SQL escape karakteri düzeltildi
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value IN ('kafeterya_hizmetleri', 'guvenlik_hizmetleri');

-- Kafeterya Hizmetleri kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('kafeterya_hizmetleri', 'bozuk_urun_satis', 'Bozulmuş ürün satışı (ekşi, kokmuş, tarihi geçmiş)', 1, true),
  ('kafeterya_hizmetleri', 'kotu_koku', 'Kafeterya içinde kötü koku olması', 2, true),
  ('kafeterya_hizmetleri', 'atik_toplanmamis', 'Kafeterya içindeki atıkların zamanında toplanmaması', 3, true),
  ('kafeterya_hizmetleri', 'cihaz_arizali_bakimsiz', 'Kafeterya içindeki cihazların (mangal, fırın, mikrodalga vb.) arızalı olması veya bakım yapılmaması', 4, true),
  ('kafeterya_hizmetleri', 'personel_hijyen_yetersiz', 'Kafeterya personelinin hijyeninde yetersizlik', 5, true),
  ('kafeterya_hizmetleri', 'ucret_yuksek', 'Kafeterya ücretinin yüksek olması', 6, true),
  ('kafeterya_hizmetleri', 'kiyafet_hijyen_uygun_degil', 'Kafeteryada çalışanların kıyafetlerinin uygun olmaması veya hijyen kurallarına uymaması', 7, true),
  ('kafeterya_hizmetleri', 'tabak_catal_bardak_kirli', 'Kafeteryada kullanılan tabak, çatal, bardak gibi araçların kirli olması', 8, true),
  ('kafeterya_hizmetleri', 'personel_yetersiz', 'Kafeteryada yetersiz personel', 9, true),
  ('kafeterya_hizmetleri', '24_saat_acik_degil', 'Kafeteryanın 24 saat açık olmaması', 10, true),
  ('kafeterya_hizmetleri', 'temiz_degil', 'Kafeteryanın temiz olmaması', 11, true),
  ('kafeterya_hizmetleri', 'mutfak_temizlik_eksik', 'Mutfak alanında temizlik eksiklikleri', 12, true),
  ('kafeterya_hizmetleri', 'masa_sandalye_kirik_dusme', 'Oturma alanında sandalye, masa kırılması / düşme riski', 13, true),
  ('kafeterya_hizmetleri', 'servis_gec', 'Servisin gecikmesi', 14, true),
  ('kafeterya_hizmetleri', 'skt_etiket_yok', 'SKT''lerin ve üretim tarihlerinin etiketlenmemiş olması', 15, true),
  ('kafeterya_hizmetleri', 'urun_kalite_yetersiz', 'Ürün kalitesinin yetersizliği', 16, true),
  ('kafeterya_hizmetleri', 'havalandirma_yetersiz', 'Yetersiz hava sirkülasyonu veya kötü havalandırma sistemi', 17, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Güvenlik Hizmetleri kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('guvenlik_hizmetleri', 'esya_kaybolma_calinma', 'Eşya kaybolması / çalınması', 1, true),
  ('guvenlik_hizmetleri', 'iletisim_ekipman_arizali', 'Güvenlik görevlilerinin iletişim ekipmanlarının arızalı olması veya yetersiz kalması', 2, true),
  ('guvenlik_hizmetleri', 'hizmet_yetersiz', 'Güvenlik hizmetlerinin yetersizliği', 3, true),
  ('guvenlik_hizmetleri', 'kamera_calismaz_eksik', 'Güvenlik kameralarının çalışmaması veya eksik olması', 4, true),
  ('guvenlik_hizmetleri', 'personel_eksik', 'Güvenlik personel sayısının eksikliği', 5, true),
  ('guvenlik_hizmetleri', 'personel_egitimsiz', 'Güvenlik personelinin eğitimsiz olması', 6, true),
  ('guvenlik_hizmetleri', 'hasta_esya_teslim_yok', 'Hasta eşyasının teslim edilmemesi', 7, true),
  ('guvenlik_hizmetleri', 'kapi_acik_zafiyet', 'Kapıların açık bırakılması nedeniyle güvenlik zafiyeti', 8, true),
  ('guvenlik_hizmetleri', 'mudahale_gec', 'Olay anında güvenlik personelinin hızlı müdahale etmemesi veya gecikmesi', 9, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
