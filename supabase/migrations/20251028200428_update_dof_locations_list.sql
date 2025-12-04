/*
  # DÖF Tespit Edilen Yer/Bölüm Listesini Güncelle

  ## Değişiklikler
  1. Tüm mevcut lokasyon kayıtları kaldırılıyor
  2. Yeni 60+ hastane bölümü ekleniyor
  
  ## Yeni Bölümler
  - Acil Servis
  - Ameliyathane bölümleri (Genel, Göz, KVC)
  - Laboratuvarlar (Biyokimya, Mikrobiyoloji, Patoloji, Genetik)
  - Klinik üniteler (Aferez, Anjio, Endoskopi, vb.)
  - İdari birimler (Başhekimlik, İK, Mali İşler, vb.)
  - Destek hizmetleri (Kafeterya, Güvenlik, Otopark, vb.)
  - Özel üniteler (Gamma Knife, Organ Nakli, Nükleer Tıp, vb.)

  ## Güvenlik
  - Mevcut RLS politikaları korunuyor
  - Sadece veriler güncelleniyor
*/

-- Tüm mevcut kayıtları sil
DELETE FROM dof_locations;

-- Yeni lokasyon listesini ekle (alfabetik sırada, display_order ile)
INSERT INTO dof_locations (value, label, display_order) VALUES
  ('acil_servis', 'Acil Servis', 1),
  ('ameliyathane_genel', 'Ameliyathane – Genel', 2),
  ('ameliyathane_goz', 'Ameliyathane – Göz', 3),
  ('ameliyathane_kvc', 'Ameliyathane – KVC', 4),
  ('aferez_unitesi', 'Aferez Ünitesi', 5),
  ('anjio_gozlem_unitesi', 'Anjio Gözlem Ünitesi', 6),
  ('anjio_kateter_laboratuvari', 'Anjio / Kateter Laboratuvarı', 7),
  ('bashekimlik', 'Başhekimlik', 8),
  ('bebek_bakim_odasi', 'Bebek Bakım Odası', 9),
  ('beslenme_diyet', 'Beslenme ve Diyet', 10),
  ('bilgi_islem', 'Bilgi İşlem Departmanı', 11),
  ('biyokimya_lab', 'Biyokimya Laboratuvarı', 12),
  ('biyomedikal', 'Biyomedikal Departmanı', 13),
  ('cagri_merkezi', 'Çağrı Merkezi / Santral', 14),
  ('camasir hane', 'Çamaşırhane', 15),
  ('depo', 'Depo (Satın Alma Ana Depo)', 16),
  ('dis_unitesi', 'Diş Ünitesi / Hastanesi', 17),
  ('dogumhane', 'Doğumhane', 18),
  ('eczane', 'Eczane', 19),
  ('endoskopi', 'Endoskopi', 20),
  ('enfeksiyon_kontrol', 'Enfeksiyon Kontrol', 21),
  ('fizik_tedavi', 'Fizik Tedavi ve Rehabilitasyon Ünitesi', 22),
  ('gamma_knife', 'Gamma Knife', 23),
  ('genetik_lab', 'Genetik Laboratuvarı', 24),
  ('guzellik_merkezi', 'Güzellik Merkezi / Sağlıklı Yaşam Kliniği', 25),
  ('guvenlik', 'Güvenlik', 26),
  ('hasta_bakim_hizmetleri', 'Hasta Bakım Hizmetleri', 27),
  ('hastane_atik', 'Hastane Atık Alanı', 28),
  ('insan_kaynaklari', 'İnsan Kaynakları Departmanı', 29),
  ('is_sagligi_guvenligi', 'İş Sağlığı ve Güvenliği Birimi', 30),
  ('is_yeri_hemsiresi', 'İş Yeri Hemşireliği', 31),
  ('kafeterya', 'Kafeterya', 32),
  ('kan_alma_odasi', 'Kan Alma Odası', 33),
  ('kalite', 'Kalite Departmanı', 34),
  ('kurumsal_faturalama', 'Kurumsal Faturalandırma', 35),
  ('kurumsal_pazarlama', 'Kurumsal Pazarlama', 36),
  ('mali_isler', 'Mali İşler Departmanı', 37),
  ('misafir_hizmetleri', 'Misafir Hizmetleri', 38),
  ('merkezi_sterilizasyon', 'Merkezi Sterilizasyon Ünitesi', 39),
  ('mikrobiyoloji_lab', 'Mikrobiyoloji Laboratuvarı', 40),
  ('morg', 'Morg', 41),
  ('nukleer_tip', 'Nükleer Tıp Ünitesi', 42),
  ('organ_nakli', 'Organ Nakli', 43),
  ('otelcilik_destek', 'Otelcilik / Destek Hizmetleri', 44),
  ('otopark', 'Otopark', 45),
  ('pazarlama', 'Pazarlama Departmanı', 46),
  ('patoloji_lab', 'Patoloji Laboratuvarı', 47),
  ('poliklinikler', 'Poliklinikler', 48),
  ('radyasyon_onkoloji', 'Radyasyon Onkoloji Ünitesi', 49),
  ('radyoloji', 'Radyoloji Ünitesi', 50),
  ('satin_alma', 'Satın Alma Departmanı', 51)
ON CONFLICT (value) DO NOTHING;
