/*
  # Personel Yönetimi ve Hasta Güvenliği/Mahremiyeti Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  İki kategori için Excel'den alınan güncel 16'şar kısa açıklamayı yükler.
  Her iki kategori için aynı açıklamalar kullanılıyor.
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Personel Yönetimi için 16 kısa açıklama ekler
  3. Hasta Güvenliği/Mahremiyeti için 16 kısa açıklama ekler
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value IN ('personel_yonetimi', 'hasta_guvenligi_mahremiyeti');

-- Personel Yönetimi kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('personel_yonetimi', 'organizasyon_sema_yok', 'Bölüm organizasyon şemasının bulunmaması', 1, true),
  ('personel_yonetimi', 'cihaz_bilgi_yok', 'Cihazın kullanımı hakkında bilgi sahibi olunmaması', 2, true),
  ('personel_yonetimi', 'calisan_guvenlik_program_bilinmiyor', 'Çalışan güvenliği programının bilinmemesi', 3, true),
  ('personel_yonetimi', 'egitim_kayit_eksik', 'Eğitim kayıtlarının eksik olması', 4, true),
  ('personel_yonetimi', 'egitim_verilmemis', 'Eğitim verilmemiş olması', 5, true),
  ('personel_yonetimi', 'gorev_yetki_yerine_getirilmemis', 'Görev Yetki ve Sorumluluklarının Yerine Getirilmemesi', 6, true),
  ('personel_yonetimi', 'olay_bildirim_yapilmamis', 'Hasta çalışan güvenliği olay bildirim yapılmaması', 7, true),
  ('personel_yonetimi', 'hasta_guvenlik_program_bilinmiyor', 'Hasta güvenlği programının bilinmemesi', 8, true),
  ('personel_yonetimi', 'kilik_kiyafet_uygunsuz', 'Kılık kıyafet prosedürüne uyulmaması', 9, true),
  ('personel_yonetimi', 'yazisma_donus_yok', 'Mail Mesaj vb yazışmalara dönüş yapılmaması', 10, true),
  ('personel_yonetimi', 'oryantasyon_eksik_yanlis_uygulama', 'Oryantasyon eğitim eksikliği nedeniyle yanlış uygulama yapılması', 11, true),
  ('personel_yonetimi', 'otomasyon_kullanilmiyor', 'Otomasyon sisteminin kullanılmaması', 12, true),
  ('personel_yonetimi', 'yaka_kart_yok', 'Personelin yaka kartının olmaması', 13, true),
  ('personel_yonetimi', 'prosedur_bilgi_yok', 'Prosedür hakkında bilgi sahibi olunmaması', 14, true),
  ('personel_yonetimi', 'prosedur_talimat_uygulanmiyor', 'Prosedür ve talimatların uygulanmaması', 15, true),
  ('personel_yonetimi', 'sertifikali_personel_yok', 'Sertifikalı personelin olmaması', 16, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Hasta Güvenliği / Mahremiyeti kısa açıklamaları (aynı açıklamalar)
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('hasta_guvenligi_mahremiyeti', 'organizasyon_sema_yok', 'Bölüm organizasyon şemasının bulunmaması', 1, true),
  ('hasta_guvenligi_mahremiyeti', 'cihaz_bilgi_yok', 'Cihazın kullanımı hakkında bilgi sahibi olunmaması', 2, true),
  ('hasta_guvenligi_mahremiyeti', 'calisan_guvenlik_program_bilinmiyor', 'Çalışan güvenliği programının bilinmemesi', 3, true),
  ('hasta_guvenligi_mahremiyeti', 'egitim_kayit_eksik', 'Eğitim kayıtlarının eksik olması', 4, true),
  ('hasta_guvenligi_mahremiyeti', 'egitim_verilmemis', 'Eğitim verilmemiş olması', 5, true),
  ('hasta_guvenligi_mahremiyeti', 'gorev_yetki_yerine_getirilmemis', 'Görev Yetki ve Sorumluluklarının Yerine Getirilmemesi', 6, true),
  ('hasta_guvenligi_mahremiyeti', 'olay_bildirim_yapilmamis', 'Hasta çalışan güvenliği olay bildirim yapılmaması', 7, true),
  ('hasta_guvenligi_mahremiyeti', 'hasta_guvenlik_program_bilinmiyor', 'Hasta güvenlği programının bilinmemesi', 8, true),
  ('hasta_guvenligi_mahremiyeti', 'kilik_kiyafet_uygunsuz', 'Kılık kıyafet prosedürüne uyulmaması', 9, true),
  ('hasta_guvenligi_mahremiyeti', 'yazisma_donus_yok', 'Mail Mesaj vb yazışmalara dönüş yapılmaması', 10, true),
  ('hasta_guvenligi_mahremiyeti', 'oryantasyon_eksik_yanlis_uygulama', 'Oryantasyon eğitim eksikliği nedeniyle yanlış uygulama yapılması', 11, true),
  ('hasta_guvenligi_mahremiyeti', 'otomasyon_kullanilmiyor', 'Otomasyon sisteminin kullanılmaması', 12, true),
  ('hasta_guvenligi_mahremiyeti', 'yaka_kart_yok', 'Personelin yaka kartının olmaması', 13, true),
  ('hasta_guvenligi_mahremiyeti', 'prosedur_bilgi_yok', 'Prosedür hakkında bilgi sahibi olunmaması', 14, true),
  ('hasta_guvenligi_mahremiyeti', 'prosedur_talimat_uygulanmiyor', 'Prosedür ve talimatların uygulanmaması', 15, true),
  ('hasta_guvenligi_mahremiyeti', 'sertifikali_personel_yok', 'Sertifikalı personelin olmaması', 16, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
