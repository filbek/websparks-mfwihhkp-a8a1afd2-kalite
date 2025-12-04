/*
  # DÖF Sorumlu Bölüm Listesini Müdürlükler ile Güncelle

  ## Değişiklikler
  1. Mevcut genel bölüm kayıtları kaldırılıyor
  2. 13 müdürlük ile değiştiriliyor
  
  ## Yeni Müdürlükler
  - Hekimlik
  - İnsan Kaynakları Müdürlüğü
  - Mali İşler Müdürlüğü
  - Kurumsal Faturalama Müdürlüğü
  - Teknik Hizmetler Müdürlüğü
  - Otelcilik ve Destek Hizmetler Müdürlüğü
  - Kalite Müdürlüğü
  - Resmi İşlemler ve Ruhsatlandırma Müdürlüğü
  - Misafir Hizmetleri Müdürlüğü
  - Hasta Bakım Hizmetleri Müdürlüğü
  - Uluslararası Misafir Hizmetleri Müdürlüğü
  - Kurumsal Tanıtım Müdürlüğü
  - Satın Alma Müdürlüğü

  ## Not
  - Bu tablo DÖF'den sorumlu olan müdürlükleri temsil eder
  - dof_locations tablosu ise tespit edilen fiziksel yer/bölümleri temsil eder
*/

-- Tüm mevcut kayıtları sil
DELETE FROM dof_sorumlu_bolumler;

-- 13 müdürlük listesini ekle
INSERT INTO dof_sorumlu_bolumler (value, label, display_order) VALUES
  ('hekimlik', 'Hekimlik', 1),
  ('insan_kaynaklari_md', 'İnsan Kaynakları Müdürlüğü', 2),
  ('mali_isler_md', 'Mali İşler Müdürlüğü', 3),
  ('kurumsal_faturalama_md', 'Kurumsal Faturalama Müdürlüğü', 4),
  ('teknik_hizmetler_md', 'Teknik Hizmetler Müdürlüğü', 5),
  ('otelcilik_destek_md', 'Otelcilik ve Destek Hizmetler Müdürlüğü', 6),
  ('kalite_md', 'Kalite Müdürlüğü', 7),
  ('resmi_islemler_md', 'Resmi İşlemler ve Ruhsatlandırma Müdürlüğü', 8),
  ('misafir_hizmetleri_md', 'Misafir Hizmetleri Müdürlüğü', 9),
  ('hasta_bakim_md', 'Hasta Bakım Hizmetleri Müdürlüğü', 10),
  ('uluslararasi_misafir_md', 'Uluslararası Misafir Hizmetleri Müdürlüğü', 11),
  ('kurumsal_tanitim_md', 'Kurumsal Tanıtım Müdürlüğü', 12),
  ('satin_alma_md', 'Satın Alma Müdürlüğü', 13)
ON CONFLICT (value) DO NOTHING;
