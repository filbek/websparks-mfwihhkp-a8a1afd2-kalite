/*
  # DOF Kategorileri ve Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  Bu migration, Excel dosyasından alınan güncel DOF kategorileri ve 
  ilgili kısa açıklamaları ile veritabanını günceller.
  
  ## Değişiklikler
  1. **Mevcut Veriler**: Önce mevcut kısa açıklamalar temizlenir
  2. **Yeni Kategoriler**: Eksik kategoriler eklenir
  3. **Kısa Açıklamalar**: Her kategori için tam liste yüklenir
  
  ## Notlar
  - Tüm kategoriler için eksiksiz kısa açıklama listesi eklenir
  - Display_order değerleri doğru sıralamayı sağlar
  - ON CONFLICT kullanılarak güvenli güncelleme yapılır
*/

-- Önce mevcut kısa açıklamaları deaktif et (silmiyoruz, güvenli)
UPDATE dof_kisa_aciklamalar SET is_active = false WHERE is_active = true;

-- Kategori ekleme veya güncelleme (eksik olanlar için)
INSERT INTO dof_kategorileri (value, label, display_order) VALUES
  ('atik_yonetimi', 'Atık Yönetimi', 1),
  ('cihaz_ve_ekipman', 'Cihaz ve Ekipman', 2),
  ('cagri_merkezi_hizmeti', 'Çağrı Merkezi Hizmeti', 3),
  ('calisanlarin_tutum_ve_davranislari', 'Çalışanların Tutum ve Davranışları', 4),
  ('dokuman_yonetimi', 'Doküman Yönetimi', 5),
  ('enfeksiyon_kontrol', 'Enfeksiyon Kontrol', 6),
  ('gostergelerin_izlenmesi', 'Göstergelerin İzlenmesi', 7),
  ('guvenlik_hizmetleri', 'Güvenlik Hizmetleri', 8),
  ('hasta_guvenligi', 'Hasta Güvenliği', 9),
  ('hasta_guvenligi_mahremiyeti', 'Hasta Güvenliği / Mahremiyeti', 10),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'Hasta Mahremiyeti ve Tıbbi Kayıtlar', 11),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'Hastane Donanımı (Oda Dahil) ve Fiziksel Sorunlar', 12),
  ('hastane_guvenligi', 'Hastane Güvenliği', 13),
  ('ilac_guvenligi', 'İlaç Güvenliği', 14),
  ('kafeterya_hizmetleri', 'Kafeterya Hizmetleri', 15),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'Laboratuvar ve Radyoloji Hizmetleri', 16),
  ('otopark_hizmetleri', 'Otopark Hizmetleri', 17),
  ('personel_yonetimi', 'Personel Yönetimi', 18),
  ('randevu_hizmetleri', 'Randevu Hizmetleri', 19),
  ('tani_ve_tedavi_hizmetleri', 'Tanı ve Tedavi Hizmetleri', 20),
  ('temizlik_yonetimi', 'Temizlik Yönetimi', 21),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'Ücretlendirme ve Faturalama Hizmetleri', 22),
  ('veri_analiz_sonuclari_kat', 'Veri Analiz Sonuçları', 23),
  ('yangin_guvenligi', 'Yangın Güvenliği', 24),
  ('yatis_ve_taburculuk_islemleri', 'Yatış ve Taburculuk İşlemleri', 25),
  ('yiyecek_icecek_hizmetleri', 'Yiyecek-İçecek Hizmetleri', 26)
ON CONFLICT (value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order;

-- Atık Yönetimi Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('atik_yonetimi', 'tibbi_atik_ayrimi', 'Tıbbi Atık Ayrımı', 1, true),
  ('atik_yonetimi', 'evsel_atik_ayrimi', 'Evsel Atık Ayrımı', 2, true),
  ('atik_yonetimi', 'geri_donusum_atiklari', 'Geri Dönüşüm Atıkları', 3, true),
  ('atik_yonetimi', 'ambalaj_atiklari', 'Ambalaj Atıkları', 4, true),
  ('atik_yonetimi', 'tehlikeli_atiklar', 'Tehlikeli Atıklar', 5, true),
  ('atik_yonetimi', 'patolojik_atiklar', 'Patolojik Atıklar', 6, true),
  ('atik_yonetimi', 'radyoaktif_atiklar', 'Radyoaktif Atıklar', 7, true),
  ('atik_yonetimi', 'kimyasal_atiklar', 'Kimyasal Atıklar', 8, true),
  ('atik_yonetimi', 'atik_torbalari', 'Atık Torbaları', 9, true),
  ('atik_yonetimi', 'atik_konteynerlari', 'Atık Konteynerları', 10, true),
  ('atik_yonetimi', 'atik_nakil_araci', 'Atık Nakil Aracı', 11, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Cihaz ve Ekipman Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('cihaz_ve_ekipman', 'tibbi_cihazlar', 'Tıbbi Cihazlar', 1, true),
  ('cihaz_ve_ekipman', 'monitorizasyon_cihazlari', 'Monitörizasyon Cihazları', 2, true),
  ('cihaz_ve_ekipman', 'ventilatör', 'Ventilatör', 3, true),
  ('cihaz_ve_ekipman', 'defibrilatör', 'Defibrilatör', 4, true),
  ('cihaz_ve_ekipman', 'infuzyonn_pompasi', 'İnfüzyon Pompası', 5, true),
  ('cihaz_ve_ekipman', 'enjektör_pompasi', 'Enjektör Pompası', 6, true),
  ('cihaz_ve_ekipman', 'ameliyat_masasi', 'Ameliyat Masası', 7, true),
  ('cihaz_ve_ekipman', 'hasta_yatagi', 'Hasta Yatağı', 8, true),
  ('cihaz_ve_ekipman', 'tekerlekli_sandalye', 'Tekerlekli Sandalye', 9, true),
  ('cihaz_ve_ekipman', 'sedye', 'Sedye', 10, true),
  ('cihaz_ve_ekipman', 'ultrason_cihazi', 'Ultrason Cihazı', 11, true),
  ('cihaz_ve_ekipman', 'ekg_cihazi', 'EKG Cihazı', 12, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Çağrı Merkezi Hizmeti Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('cagri_merkezi_hizmeti', 'randevu_alma', 'Randevu Alma', 1, true),
  ('cagri_merkezi_hizmeti', 'bilgi_alma', 'Bilgi Alma', 2, true),
  ('cagri_merkezi_hizmeti', 'sikayet_iletimi', 'Şikayet İletimi', 3, true),
  ('cagri_merkezi_hizmeti', 'sonuc_ogrenme', 'Sonuç Öğrenme', 4, true),
  ('cagri_merkezi_hizmeti', 'yonlendirme', 'Yönlendirme', 5, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Çalışanların Tutum ve Davranışları Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('calisanlarin_tutum_ve_davranislari', 'hekim', 'Hekim', 1, true),
  ('calisanlarin_tutum_ve_davranislari', 'hemsire', 'Hemşire', 2, true),
  ('calisanlarin_tutum_ve_davranislari', 'personel', 'Personel', 3, true),
  ('calisanlarin_tutum_ve_davranislari', 'guvenlik', 'Güvenlik', 4, true),
  ('calisanlarin_tutum_ve_davranislari', 'temizlik', 'Temizlik', 5, true),
  ('calisanlarin_tutum_ve_davranislari', 'teknik_personel', 'Teknik Personel', 6, true),
  ('calisanlarin_tutum_ve_davranislari', 'idari_personel', 'İdari Personel', 7, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Doküman Yönetimi Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('dokuman_yonetimi', 'prosedur', 'Prosedür', 1, true),
  ('dokuman_yonetimi', 'talimat', 'Talimat', 2, true),
  ('dokuman_yonetimi', 'form', 'Form', 3, true),
  ('dokuman_yonetimi', 'kayit', 'Kayıt', 4, true),
  ('dokuman_yonetimi', 'politika', 'Politika', 5, true),
  ('dokuman_yonetimi', 'yonerge', 'Yönerge', 6, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Enfeksiyon Kontrol Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('enfeksiyon_kontrol', 'el_hijyeni', 'El Hijyeni', 1, true),
  ('enfeksiyon_kontrol', 'kisisel_koruyucu_ekipman', 'Kişisel Koruyucu Ekipman', 2, true),
  ('enfeksiyon_kontrol', 'sterilizasyon', 'Sterilizasyon', 3, true),
  ('enfeksiyon_kontrol', 'dezenfeksiyon', 'Dezenfeksiyon', 4, true),
  ('enfeksiyon_kontrol', 'izolasyon', 'İzolasyon', 5, true),
  ('enfeksiyon_kontrol', 'atik_yonetimi_enf', 'Atık Yönetimi', 6, true),
  ('enfeksiyon_kontrol', 'cevre_temizligi', 'Çevre Temizliği', 7, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Göstergelerin İzlenmesi Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('gostergelerin_izlenmesi', 'kalite_gostergeleri', 'Kalite Göstergeleri', 1, true),
  ('gostergelerin_izlenmesi', 'performans_gostergeleri', 'Performans Göstergeleri', 2, true),
  ('gostergelerin_izlenmesi', 'hasta_guvenlik_gostergeleri', 'Hasta Güvenlik Göstergeleri', 3, true),
  ('gostergelerin_izlenmesi', 'enfeksiyon_gostergeleri', 'Enfeksiyon Göstergeleri', 4, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Güvenlik Hizmetleri Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('guvenlik_hizmetleri', 'giris_cikis_kontrolu', 'Giriş Çıkış Kontrolü', 1, true),
  ('guvenlik_hizmetleri', 'kamera_sistemi', 'Kamera Sistemi', 2, true),
  ('guvenlik_hizmetleri', 'alarm_sistemi', 'Alarm Sistemi', 3, true),
  ('guvenlik_hizmetleri', 'guvenlik_personeli', 'Güvenlik Personeli', 4, true),
  ('guvenlik_hizmetleri', 'otopark_guvenligi', 'Otopark Güvenliği', 5, true),
  ('guvenlik_hizmetleri', 'acil_durum_guvenligi', 'Acil Durum Güvenliği', 6, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Hasta Güvenliği Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('hasta_guvenligi', 'hasta_dusmesi', 'Hasta Düşmesi', 1, true),
  ('hasta_guvenligi', 'hasta_kimligi', 'Hasta Kimliği', 2, true),
  ('hasta_guvenligi', 'ilac_guvenligi_hg', 'İlaç Güvenliği', 3, true),
  ('hasta_guvenligi', 'ameliyat_guvenligi', 'Ameliyat Güvenliği', 4, true),
  ('hasta_guvenligi', 'kan_urun_guvenligi', 'Kan Ürün Güvenliği', 5, true),
  ('hasta_guvenligi', 'hasta_iletisimi', 'Hasta İletişimi', 6, true),
  ('hasta_guvenligi', 'hasta_hakları', 'Hasta Hakları', 7, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Hasta Güvenliği / Mahremiyeti Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('hasta_guvenligi_mahremiyeti', 'kisisel_bilgi_guvenligi', 'Kişisel Bilgi Güvenliği', 1, true),
  ('hasta_guvenligi_mahremiyeti', 'tibbi_kayit_guvenligi', 'Tıbbi Kayıt Güvenliği', 2, true),
  ('hasta_guvenligi_mahremiyeti', 'mahremiyet_ihlali', 'Mahremiyet İhlali', 3, true),
  ('hasta_guvenligi_mahremiyeti', 'bilgi_paylasimi', 'Bilgi Paylaşımı', 4, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Hasta Mahremiyeti ve Tıbbi Kayıtlar Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'tibbi_kayit_tutma', 'Tıbbi Kayıt Tutma', 1, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'kayit_saklama', 'Kayıt Saklama', 2, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'kayit_erisimi', 'Kayıt Erişimi', 3, true),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'hasta_onay_formlari', 'Hasta Onay Formları', 4, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Hastane Donanımı ve Fiziksel Sorunlar Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'bina_bakim', 'Bina Bakım', 1, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'havalandirma', 'Havalandırma', 2, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'aydinlatma', 'Aydınlatma', 3, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'isiتma_sogutma', 'Isıtma/Soğutma', 4, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'su_sistemi', 'Su Sistemi', 5, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'elektrik_sistemi', 'Elektrik Sistemi', 6, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'asansor', 'Asansör', 7, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'oda_mobilyalari', 'Oda Mobilyaları', 8, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Hastane Güvenliği Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('hastane_guvenligi', 'yangin_guvenligi', 'Yangın Güvenliği', 1, true),
  ('hastane_guvenligi', 'acil_durum_plani', 'Acil Durum Planı', 2, true),
  ('hastane_guvenligi', 'tahliye_plani', 'Tahliye Planı', 3, true),
  ('hastane_guvenligi', 'guvenlik_egitimi', 'Güvenlik Eğitimi', 4, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- İlaç Güvenliği Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('ilac_guvenligi', 'ilac_reçetesi', 'İlaç Reçetesi', 1, true),
  ('ilac_guvenligi', 'ilac_hazirlama', 'İlaç Hazırlama', 2, true),
  ('ilac_guvenligi', 'ilac_uygulama', 'İlaç Uygulama', 3, true),
  ('ilac_guvenligi', 'ilac_saklama', 'İlaç Saklama', 4, true),
  ('ilac_guvenligi', 'ilac_takip', 'İlaç Takip', 5, true),
  ('ilac_guvenligi', 'yuksek_riskli_ilaclar', 'Yüksek Riskli İlaçlar', 6, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Kafeterya Hizmetleri Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('kafeterya_hizmetleri', 'gida_hijyeni', 'Gıda Hijyeni', 1, true),
  ('kafeterya_hizmetleri', 'gida_saklama', 'Gıda Saklama', 2, true),
  ('kafeterya_hizmetleri', 'gida_hazirlama', 'Gıda Hazırlama', 3, true),
  ('kafeterya_hizmetleri', 'servis', 'Servis', 4, true),
  ('kafeterya_hizmetleri', 'menu', 'Menü', 5, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Laboratuvar ve Radyoloji Hizmetleri Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('laboratuvar_ve_radyoloji_hizmetleri', 'numune_alma', 'Numune Alma', 1, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'numune_tasima', 'Numune Taşıma', 2, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'test_sonuclari', 'Test Sonuçları', 3, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'goruntuleme', 'Görüntüleme', 4, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'radyasyon_guvenligi', 'Radyasyon Güvenliği', 5, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Otopark Hizmetleri Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('otopark_hizmetleri', 'otopark_kapasitesi', 'Otopark Kapasitesi', 1, true),
  ('otopark_hizmetleri', 'otopark_guvenligi', 'Otopark Güvenliği', 2, true),
  ('otopark_hizmetleri', 'otopark_aydinlatma', 'Otopark Aydınlatma', 3, true),
  ('otopark_hizmetleri', 'otopark_yonlendirme', 'Otopark Yönlendirme', 4, true),
  ('otopark_hizmetleri', 'engelli_park_yeri', 'Engelli Park Yeri', 5, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Personel Yönetimi Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('personel_yonetimi', 'işe_alim', 'İşe Alım', 1, true),
  ('personel_yonetimi', 'egitim', 'Eğitim', 2, true),
  ('personel_yonetimi', 'yetkinlik', 'Yetkinlik', 3, true),
  ('personel_yonetimi', 'performans_degerlendirme', 'Performans Değerlendirme', 4, true),
  ('personel_yonetimi', 'gorevlendirme', 'Görevlendirme', 5, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Randevu Hizmetleri Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('randevu_hizmetleri', 'randevu_alma', 'Randevu Alma', 1, true),
  ('randevu_hizmetleri', 'randevu_iptal', 'Randevu İptal', 2, true),
  ('randevu_hizmetleri', 'randevu_degisiklik', 'Randevu Değişiklik', 3, true),
  ('randevu_hizmetleri', 'randevu_hatirlatma', 'Randevu Hatırlatma', 4, true),
  ('randevu_hizmetleri', 'online_randevu', 'Online Randevu', 5, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Tanı ve Tedavi Hizmetleri Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('tani_ve_tedavi_hizmetleri', 'muayene', 'Muayene', 1, true),
  ('tani_ve_tedavi_hizmetleri', 'tani', 'Tanı', 2, true),
  ('tani_ve_tedavi_hizmetleri', 'tedavi_plani', 'Tedavi Planı', 3, true),
  ('tani_ve_tedavi_hizmetleri', 'tedavi_uygulama', 'Tedavi Uygulama', 4, true),
  ('tani_ve_tedavi_hizmetleri', 'takip', 'Takip', 5, true),
  ('tani_ve_tedavi_hizmetleri', 'konsultasyon', 'Konsültasyon', 6, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Temizlik Yönetimi Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('temizlik_yonetimi', 'genel_temizlik', 'Genel Temizlik', 1, true),
  ('temizlik_yonetimi', 'terminal_temizlik', 'Terminal Temizlik', 2, true),
  ('temizlik_yonetimi', 'dezenfeksiyon', 'Dezenfeksiyon', 3, true),
  ('temizlik_yonetimi', 'temizlik_malzemeleri', 'Temizlik Malzemeleri', 4, true),
  ('temizlik_yonetimi', 'temizlik_personeli', 'Temizlik Personeli', 5, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Ücretlendirme ve Faturalama Hizmetleri Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('ucretlendirme_ve_faturalama_hizmetleri', 'fatura_duzenleme', 'Fatura Düzenleme', 1, true),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'odeme_alma', 'Ödeme Alma', 2, true),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'sigorta_islemleri', 'Sigorta İşlemleri', 3, true),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'fiyat_listeleri', 'Fiyat Listeleri', 4, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Veri Analiz Sonuçları Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('veri_analiz_sonuclari_kat', 'veri_toplama', 'Veri Toplama', 1, true),
  ('veri_analiz_sonuclari_kat', 'veri_analizi', 'Veri Analizi', 2, true),
  ('veri_analiz_sonuclari_kat', 'raporlama', 'Raporlama', 3, true),
  ('veri_analiz_sonuclari_kat', 'iyilestirme', 'İyileştirme', 4, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Yangın Güvenliği Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('yangin_guvenligi', 'yangin_alarm', 'Yangın Alarm', 1, true),
  ('yangin_guvenligi', 'yangin_sondurme', 'Yangın Söndürme', 2, true),
  ('yangin_guvenligi', 'yangin_merdiveni', 'Yangın Merdiveni', 3, true),
  ('yangin_guvenligi', 'yangin_egitimi', 'Yangın Eğitimi', 4, true),
  ('yangin_guvenligi', 'yangin_tatbikati', 'Yangın Tatbikatı', 5, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Yatış ve Taburculuk İşlemleri Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('yatis_ve_taburculuk_islemleri', 'yatis_islemleri', 'Yatış İşlemleri', 1, true),
  ('yatis_ve_taburculuk_islemleri', 'yatak_tahsisi', 'Yatak Tahsisi', 2, true),
  ('yatis_ve_taburculuk_islemleri', 'hasta_kabulü', 'Hasta Kabulü', 3, true),
  ('yatis_ve_taburculuk_islemleri', 'taburcu_islemleri', 'Taburcu İşlemleri', 4, true),
  ('yatis_ve_taburculuk_islemleri', 'taburcu_ozeti', 'Taburcu Özeti', 5, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Yiyecek-İçecek Hizmetleri Kısa Açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('yiyecek_icecek_hizmetleri', 'hasta_yemekleri', 'Hasta Yemekleri', 1, true),
  ('yiyecek_icecek_hizmetleri', 'diyet_yemekleri', 'Diyet Yemekleri', 2, true),
  ('yiyecek_icecek_hizmetleri', 'yemek_dagitimi', 'Yemek Dağıtımı', 3, true),
  ('yiyecek_icecek_hizmetleri', 'gida_guvenligi', 'Gıda Güvenliği', 4, true),
  ('yiyecek_icecek_hizmetleri', 'yemek_sicakligi', 'Yemek Sıcaklığı', 5, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;