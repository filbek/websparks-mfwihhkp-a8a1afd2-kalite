/*
  # Tanı ve Tedavi Hizmetleri & Hasta Mahremiyeti ve Tıbbi Kayıtlar Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  İki kategori için Excel'den alınan güncel kısa açıklamaları yükler:
  - Tanı ve Tedavi Hizmetleri: 19 açıklama
  - Hasta Mahremiyeti ve Tıbbi Kayıtlar: 12 açıklama
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni açıklamaları ekler
  
  ## Not
  Kategori value'ları doğru: tani_ve_tedavi_hizmetleri, hasta_mahremiyeti_ve_tibbi_kayitlar
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value IN ('tani_ve_tedavi_hizmetleri', 'hasta_mahremiyeti_ve_tibbi_kayitlar');

-- Tanı ve Tedavi Hizmetleri kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('tani_ve_tedavi_hizmetleri', 'agri_yonetim_etkin_degil', 'Ağrı yönetiminin etkin yapılamaması', 1, true),
  ('tani_ve_tedavi_hizmetleri', 'operasyon_yapilmamis_dusunce', 'Belirtilen operasyonun yapılmadığı düşüncesi', 2, true),
  ('tani_ve_tedavi_hizmetleri', 'diyetisyen_degerlendirme_yok', 'Diyetisyen Tarafından Hastanın Değerlendirilmemesi', 3, true),
  ('tani_ve_tedavi_hizmetleri', 'tedavi_bakim_eksik', 'Gerekli tedavi/bakım/müdahalenin eksik yapılması', 4, true),
  ('tani_ve_tedavi_hizmetleri', 'tedavi_bakim_zamaninda_degil', 'Gerekli tedavi/bakım/müdahalenin zamanında yapılamaması', 5, true),
  ('tani_ve_tedavi_hizmetleri', 'basinc_yarasi', 'Hastada Basınç Yarası Gelişmiş Olması', 6, true),
  ('tani_ve_tedavi_hizmetleri', 'hekim_ziyaret_yok', 'Hastanın hekim tarafından odada ziyaret edilmemesi', 7, true),
  ('tani_ve_tedavi_hizmetleri', 'rapor_gec', 'Hastaya ait raporun geç yazılması', 8, true),
  ('tani_ve_tedavi_hizmetleri', 'ilac_gec', 'İlacın geç gelmesi', 9, true),
  ('tani_ve_tedavi_hizmetleri', 'kan_alma_sure_olcum_yok', 'Kan  alma sürelerinin ölçülmemesi', 10, true),
  ('tani_ve_tedavi_hizmetleri', 'malzeme_eksik_hizmet_yok', 'Malzeme eksikliği nedeni ile hizmet verilememesi', 11, true),
  ('tani_ve_tedavi_hizmetleri', 'baska_hekim_dusunce', 'Operasyona başka hekimin girdiği düşüncesi', 12, true),
  ('tani_ve_tedavi_hizmetleri', 'randevu_sonuc_sure_olcum_yok', 'Randevu ve  sonuç verme sürelerinin ölçülmemesi', 13, true),
  ('tani_ve_tedavi_hizmetleri', 'randevu_uyum_yok', 'Randevuya uyum sağlanmaması', 14, true),
  ('tani_ve_tedavi_hizmetleri', 'sonuc_zamaninda_degil', 'Sonuçların zamanında verilmemesi', 15, true),
  ('tani_ve_tedavi_hizmetleri', 'tani_konulamadi', 'Tanı konulamaması', 16, true),
  ('tani_ve_tedavi_hizmetleri', 'tani_gec', 'Tanının geç konulması', 17, true),
  ('tani_ve_tedavi_hizmetleri', 'tedavi_etkili_degil', 'Tedavi etkili değil, iyileştirme süreci sağlanamadı', 18, true),
  ('tani_ve_tedavi_hizmetleri', 'tani_yanlis', 'Yanlış tanı konulması', 19, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Hasta Mahremiyeti ve Tıbbi Kayıtlar kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'poliklinik_iki_hasta', 'Aynı anda poliklinik odadasında iki hastanın olması', 1, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'dosya_rapor_eksik_hata', 'Dosya ya da raporda eksiklik / hata olması', 2, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'bilgi_gizlilik_yok', 'Hasta bilgi gizliliğinin sağlanmıyor olması', 3, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'bilgi_paylasim_izinsiz', 'Hasta bilgilerinin hastanın onayı dışında başkasıyla paylaşılması', 4, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'dosya_karistirilmis', 'Hasta dosyalarının karıştırılması', 5, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'dosya_ulasabilir_depo', 'Hasta dosyalarının ulaşılabilir şekilde depolanması', 6, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'mahremiyet_dikkat_yok', 'Hasta mahremiyetine dikkat edilmemesi', 7, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'bilgi_acikta', 'Hastalara ait bilgilerin açıkta bırakılması', 8, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'hizmet_giris_yapilmamis', 'Hastaya ait hizmet girişlerinin yapılmaması', 9, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'mahremiyet_perde_yok', 'Mahremiyet perdesinin olmaması', 10, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'kayit_giris_yanlis', 'Tıbbi kayıt girişinde yanlışlık', 11, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'kayit_kayip_zarar', 'Tıbbi kayıtların kaybolması, zarar görmesi', 12, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
