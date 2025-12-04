/*
  # DÖF Lookup Verilerini Yükleme

  ## Açıklama
  Bu migration, DÖF formunda kullanılan tüm statik verileri veritabanına yükler:
  
  1. **DÖF Kaynakları** (8 adet)
     - Öz Değerlendirme Uygunsuzluğu
     - Ürün / Hizmet / Süreç Uygunsuzluğu
     - Veri Analiz Sonuçları
     - Olay Bildirimleri
     - Müşteri Şikayeti
     - Saha Denetim Uygunsuzluğu
     - Bina Tesis Turu Uygunsuzluğu
  
  2. **DÖF Kategorileri** (26 adet)
     - Atık Yönetimi, Cihaz ve Ekipman, vb.
  
  3. **DÖF Kısa Açıklamalar** (100+ adet)
     - Her kategori için ilgili kısa açıklamalar
  
  4. **Sorumlu Bölümler** (6 adet)
     - Kalite Yönetimi, Hasta Güvenlik, vb.
*/

-- DÖF Kaynakları
INSERT INTO dof_kaynaklari (value, label, display_order) VALUES
  ('oz_degerlendirme_uygunsuslugu', 'Öz Değerlendirme Uygunsuzluğu', 1),
  ('urun_hizmet_surec_uygunsuslugu', 'Ürün / Hizmet / Süreç Uygunsuzluğu', 2),
  ('veri_analiz_sonuclari', 'Veri Analiz Sonuçları', 3),
  ('olay_bildirimleri', 'Olay Bildirimleri', 4),
  ('musteri_sikayeti', 'Müşteri Şikayeti', 5),
  ('saha_denetim_uygunsuslugu', 'Saha Denetim Uygunsuzluğu', 6),
  ('bina_tesis_turu_uygunsuslugu', 'Bina Tesis Turu Uygunsuzluğu', 7)
ON CONFLICT (value) DO NOTHING;

-- DÖF Kategorileri
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
ON CONFLICT (value) DO NOTHING;

-- DÖF Sorumlu Bölümler
INSERT INTO dof_sorumlu_bolumler (value, label, display_order) VALUES
  ('kalite_yonetimi', 'Kalite Yönetimi', 1),
  ('hasta_guvenlik', 'Hasta Güvenlik', 2),
  ('enfeksiyon_kontrol', 'Enfeksiyon Kontrol', 3),
  ('teknik_hizmetler', 'Teknik Hizmetler', 4),
  ('insan_kaynaklari', 'İnsan Kaynakları', 5),
  ('tibbi_hizmetler', 'Tıbbi Hizmetler', 6)
ON CONFLICT (value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Atık Yönetimi
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('atik_yonetimi', 'atik_ayirma_eksikligi', 'Atık Ayırma Eksikliği', 1),
  ('atik_yonetimi', 'atik_depolama_sorunu', 'Atık Depolama Sorunu', 2),
  ('atik_yonetimi', 'tibbi_atik_yonetimi', 'Tıbbi Atık Yönetimi', 3),
  ('atik_yonetimi', 'atik_bertaraf_sureci', 'Atık Bertaraf Süreci', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Cihaz ve Ekipman
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('cihaz_ve_ekipman', 'cihaz_ariza', 'Cihaz Arızası', 1),
  ('cihaz_ve_ekipman', 'bakim_eksikligi', 'Bakım Eksikliği', 2),
  ('cihaz_ve_ekipman', 'kalibrasyon_sorunu', 'Kalibrasyon Sorunu', 3),
  ('cihaz_ve_ekipman', 'yedek_parca_eksikligi', 'Yedek Parça Eksikliği', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Çağrı Merkezi Hizmeti
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('cagri_merkezi_hizmeti', 'yanit_suresi_uzun', 'Yanıt Süresi Uzun', 1),
  ('cagri_merkezi_hizmeti', 'bilgi_eksikligi', 'Bilgi Eksikliği', 2),
  ('cagri_merkezi_hizmeti', 'iletisim_sorunu', 'İletişim Sorunu', 3),
  ('cagri_merkezi_hizmeti', 'sistem_ariza', 'Sistem Arızası', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Çalışanların Tutum ve Davranışları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('calisanlarin_tutum_ve_davranislari', 'iletisim_eksikligi', 'İletişim Eksikliği', 1),
  ('calisanlarin_tutum_ve_davranislari', 'meslek_etigi_ihlali', 'Meslek Etiği İhlali', 2),
  ('calisanlarin_tutum_ve_davranislari', 'hasta_yaklasimi', 'Hasta Yaklaşımı', 3),
  ('calisanlarin_tutum_ve_davranislari', 'ekip_calismasi_sorunu', 'Ekip Çalışması Sorunu', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Doküman Yönetimi
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('dokuman_yonetimi', 'prosedur_eksikligi', 'Prosedür Eksikliği', 1),
  ('dokuman_yonetimi', 'dokuman_guncelleme', 'Doküman Güncelleme', 2),
  ('dokuman_yonetimi', 'erisim_sorunu', 'Erişim Sorunu', 3),
  ('dokuman_yonetimi', 'versiyon_kontrolu', 'Versiyon Kontrolü', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Enfeksiyon Kontrol
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('enfeksiyon_kontrol', 'el_hijyeni_eksikligi', 'El Hijyeni Eksikliği', 1),
  ('enfeksiyon_kontrol', 'izolasyon_kurallari', 'İzolasyon Kuralları', 2),
  ('enfeksiyon_kontrol', 'sterilizasyon_hatasi', 'Sterilizasyon Hatası', 3),
  ('enfeksiyon_kontrol', 'koruyucu_ekipman', 'Koruyucu Ekipman', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Göstergelerin İzlenmesi
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('gostergelerin_izlenmesi', 'veri_toplama_eksikligi', 'Veri Toplama Eksikliği', 1),
  ('gostergelerin_izlenmesi', 'analiz_yetersizligi', 'Analiz Yetersizliği', 2),
  ('gostergelerin_izlenmesi', 'raporlama_gecikme', 'Raporlama Gecikme', 3),
  ('gostergelerin_izlenmesi', 'hedef_sapma', 'Hedef Sapma', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Güvenlik Hizmetleri
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('guvenlik_hizmetleri', 'giris_cikis_kontrolu', 'Giriş Çıkış Kontrolü', 1),
  ('guvenlik_hizmetleri', 'kamera_sistemi', 'Kamera Sistemi', 2),
  ('guvenlik_hizmetleri', 'alarm_sistemi', 'Alarm Sistemi', 3),
  ('guvenlik_hizmetleri', 'guvenlik_personeli', 'Güvenlik Personeli', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Hasta Güvenliği
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('hasta_guvenligi', 'hasta_dusmesi', 'Hasta Düşmesi', 1),
  ('hasta_guvenligi', 'ilac_hatasi', 'İlaç Hatası', 2),
  ('hasta_guvenligi', 'hasta_kimlik_dogrulama', 'Hasta Kimlik Doğrulama', 3),
  ('hasta_guvenligi', 'ameliyat_guvenligi', 'Ameliyat Güvenliği', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Hasta Güvenliği / Mahremiyeti
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('hasta_guvenligi_mahremiyeti', 'kisisel_veri_guvenligi', 'Kişisel Veri Güvenliği', 1),
  ('hasta_guvenligi_mahremiyeti', 'mahremiyet_ihlali', 'Mahremiyet İhlali', 2),
  ('hasta_guvenligi_mahremiyeti', 'bilgi_paylasimi', 'Bilgi Paylaşımı', 3),
  ('hasta_guvenligi_mahremiyeti', 'hasta_hakları', 'Hasta Hakları', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Hasta Mahremiyeti ve Tıbbi Kayıtlar
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'kayit_guvenligi', 'Kayıt Güvenliği', 1),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'erisim_yetkisi', 'Erişim Yetkisi', 2),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'veri_yedekleme', 'Veri Yedekleme', 3),
  ('hasta_mahremiyeti_ve_tibbi_kayitlar', 'hasta_onay_formlari', 'Hasta Onay Formları', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Hastane Donanımı ve Fiziksel Sorunlar
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'bina_bakim', 'Bina Bakım', 1),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'havalandirma_sistemi', 'Havalandırma Sistemi', 2),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'aydinlatma_sorunu', 'Aydınlatma Sorunu', 3),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'su_elektrik_kesintisi', 'Su/Elektrik Kesintisi', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Hastane Güvenliği
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('hastane_guvenligi', 'yangin_guvenligi', 'Yangın Güvenliği', 1),
  ('hastane_guvenligi', 'acil_cikis_yollari', 'Acil Çıkış Yolları', 2),
  ('hastane_guvenligi', 'guvenlik_kameralari', 'Güvenlik Kameraları', 3),
  ('hastane_guvenligi', 'ziyaretci_kontrolu', 'Ziyaretçi Kontrolü', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - İlaç Güvenliği
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('ilac_guvenligi', 'ilac_saklama', 'İlaç Saklama', 1),
  ('ilac_guvenligi', 'son_kullanma_tarihi', 'Son Kullanma Tarihi', 2),
  ('ilac_guvenligi', 'dozaj_hatasi', 'Dozaj Hatası', 3),
  ('ilac_guvenligi', 'ilac_etkilesimi', 'İlaç Etkileşimi', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Kafeterya Hizmetleri
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('kafeterya_hizmetleri', 'gida_guvenligi', 'Gıda Güvenliği', 1),
  ('kafeterya_hizmetleri', 'hijyen_kurallari', 'Hijyen Kuralları', 2),
  ('kafeterya_hizmetleri', 'menu_cesitliligi', 'Menü Çeşitliliği', 3),
  ('kafeterya_hizmetleri', 'servis_kalitesi', 'Servis Kalitesi', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Laboratuvar ve Radyoloji Hizmetleri
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('laboratuvar_ve_radyoloji_hizmetleri', 'test_sonuc_gecikme', 'Test Sonuç Gecikme', 1),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'numune_kaybi', 'Numune Kaybı', 2),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'cihaz_kalibrasyon', 'Cihaz Kalibrasyon', 3),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'radyasyon_guvenligi', 'Radyasyon Güvenliği', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Otopark Hizmetleri
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('otopark_hizmetleri', 'park_yeri_yetersizligi', 'Park Yeri Yetersizliği', 1),
  ('otopark_hizmetleri', 'guvenlik_sorunu', 'Güvenlik Sorunu', 2),
  ('otopark_hizmetleri', 'aydinlatma_eksikligi', 'Aydınlatma Eksikliği', 3),
  ('otopark_hizmetleri', 'yonlendirme_tabelasi', 'Yönlendirme Tabelası', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Personel Yönetimi
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('personel_yonetimi', 'egitim_eksikligi', 'Eğitim Eksikliği', 1),
  ('personel_yonetimi', 'personel_yetersizligi', 'Personel Yetersizliği', 2),
  ('personel_yonetimi', 'vardiya_planlama', 'Vardiya Planlama', 3),
  ('personel_yonetimi', 'motivasyon_sorunu', 'Motivasyon Sorunu', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Randevu Hizmetleri
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('randevu_hizmetleri', 'randevu_sistemi_ariza', 'Randevu Sistemi Arızası', 1),
  ('randevu_hizmetleri', 'bekleme_suresi', 'Bekleme Süresi', 2),
  ('randevu_hizmetleri', 'randevu_iptali', 'Randevu İptali', 3),
  ('randevu_hizmetleri', 'bilgilendirme_eksikligi', 'Bilgilendirme Eksikliği', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Tanı ve Tedavi Hizmetleri
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('tani_ve_tedavi_hizmetleri', 'tani_gecikme', 'Tanı Gecikme', 1),
  ('tani_ve_tedavi_hizmetleri', 'tedavi_plani', 'Tedavi Planı', 2),
  ('tani_ve_tedavi_hizmetleri', 'hasta_takip', 'Hasta Takip', 3),
  ('tani_ve_tedavi_hizmetleri', 'konsultasyon_sureci', 'Konsültasyon Süreci', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Temizlik Yönetimi
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('temizlik_yonetimi', 'temizlik_standardi', 'Temizlik Standardı', 1),
  ('temizlik_yonetimi', 'dezenfeksiyon_eksikligi', 'Dezenfeksiyon Eksikliği', 2),
  ('temizlik_yonetimi', 'temizlik_malzemesi', 'Temizlik Malzemesi', 3),
  ('temizlik_yonetimi', 'personel_egitimi', 'Personel Eğitimi', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Ücretlendirme ve Faturalama Hizmetleri
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('ucretlendirme_ve_faturalama_hizmetleri', 'fatura_hatasi', 'Fatura Hatası', 1),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'odeme_sistemi', 'Ödeme Sistemi', 2),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'sigorta_islemleri', 'Sigorta İşlemleri', 3),
  ('ucretlendirme_ve_faturalama_hizmetleri', 'fiyat_bilgilendirme', 'Fiyat Bilgilendirme', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Veri Analiz Sonuçları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('veri_analiz_sonuclari_kat', 'veri_kalitesi', 'Veri Kalitesi', 1),
  ('veri_analiz_sonuclari_kat', 'analiz_yontemi', 'Analiz Yöntemi', 2),
  ('veri_analiz_sonuclari_kat', 'raporlama_formati', 'Raporlama Formatı', 3),
  ('veri_analiz_sonuclari_kat', 'trend_analizi', 'Trend Analizi', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Yangın Güvenliği
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('yangin_guvenligi', 'yangin_alarm_sistemi', 'Yangın Alarm Sistemi', 1),
  ('yangin_guvenligi', 'sondurme_sistemi', 'Söndürme Sistemi', 2),
  ('yangin_guvenligi', 'acil_cikis_isaret', 'Acil Çıkış İşaret', 3),
  ('yangin_guvenligi', 'yangin_tatbikati', 'Yangın Tatbikatı', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Yatış ve Taburculuk İşlemleri
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('yatis_ve_taburculuk_islemleri', 'yatis_sureci', 'Yatış Süreci', 1),
  ('yatis_ve_taburculuk_islemleri', 'taburcu_planlama', 'Taburcu Planlama', 2),
  ('yatis_ve_taburculuk_islemleri', 'hasta_bilgilendirme', 'Hasta Bilgilendirme', 3),
  ('yatis_ve_taburculuk_islemleri', 'evrak_islemleri', 'Evrak İşlemleri', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;

-- DÖF Kısa Açıklamalar - Yiyecek-İçecek Hizmetleri
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order) VALUES
  ('yiyecek_icecek_hizmetleri', 'diyet_uygunlugu', 'Diyet Uygunluğu', 1),
  ('yiyecek_icecek_hizmetleri', 'sicaklik_kontrolu', 'Sıcaklık Kontrolü', 2),
  ('yiyecek_icecek_hizmetleri', 'porsiyon_buyuklugu', 'Porsiyon Büyüklüğü', 3),
  ('yiyecek_icecek_hizmetleri', 'servis_zamani', 'Servis Zamanı', 4)
ON CONFLICT (kategori_value, value) DO NOTHING;