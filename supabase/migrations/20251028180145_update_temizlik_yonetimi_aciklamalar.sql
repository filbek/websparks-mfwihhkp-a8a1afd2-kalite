/*
  # Temizlik Yönetimi Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  Temizlik Yönetimi kategorisi için Excel'den alınan güncel 25 kısa açıklamayı yükler.
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni 25 kısa açıklamayı ekler
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value = 'temizlik_yonetimi';

-- Yeni Temizlik Yönetimi kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('temizlik_yonetimi', 'alan_kirli', 'Alanın kirli olması', 1, true),
  ('temizlik_yonetimi', 'atik_kova_kirik', 'Atık kovasının kırık olması', 2, true),
  ('temizlik_yonetimi', 'hastane_temizlik_yetersiz', 'Hastane temizliğinin yetersiz olması', 3, true),
  ('temizlik_yonetimi', 'kimyasal_kullanim_yanlis', 'Kimyasal temizlik maddelerinin personel tarafından doğru şekilde kullanılmaması ve uygun güvenlik önlemlerinin alınmaması', 4, true),
  ('temizlik_yonetimi', 'kirli_oda_standart_dusum', 'Kirli odalarının istenilen standartları karşılamaması', 5, true),
  ('temizlik_yonetimi', 'kirli_oda_sicaklik_nem_yok', 'Kirli temiz oda sıcaklık nem takiplerinin yapılmaması', 6, true),
  ('temizlik_yonetimi', 'kirli_malzeme_temiz_alan', 'Kirli temizlik malzemelerinin temiz alanlara taşınması', 7, true),
  ('temizlik_yonetimi', 'kirli_temiz_oda_kilitsiz', 'Kirli ve temiz odalarının kilitli olmaması', 8, true),
  ('temizlik_yonetimi', 'kontrol_liste_etkin_degil', 'Kontrol listelerinin etkin doldurulmaması', 9, true),
  ('temizlik_yonetimi', 'dezenfektan_etiketsiz', 'Kullanılan dezenfektanların etiketlenmemiş olması', 10, true),
  ('temizlik_yonetimi', 'dezenfektan_uygunsuz', 'Kullanılan dezenfektanların uygun olmaması', 11, true),
  ('temizlik_yonetimi', 'oda_temizlik_yetersiz', 'Oda temizliğinin yetersiz olması', 12, true),
  ('temizlik_yonetimi', 'banyo_malzeme_eksik', 'Odada banyo malzeme eksikliği', 13, true),
  ('temizlik_yonetimi', 'hasere', 'Odada haşere görülmesi', 14, true),
  ('temizlik_yonetimi', 'hijyen_kosul_uygunsuz', 'Odalarda hijyenik olmayan koşulların sürdürülmesi (örneğin, sızıntı, çürük, kötü kokular)', 15, true),
  ('temizlik_yonetimi', 'partikul_olcum_yok', 'Partikül ölçümünün yapılmaması', 16, true),
  ('temizlik_yonetimi', 'temiz_oda_amac_disi', 'Temiz odalarının amaç dışı kullanımı', 17, true),
  ('temizlik_yonetimi', 'temizlik_yanlis_zaman', 'Temizliğin yanlış zamanda yapılması', 18, true),
  ('temizlik_yonetimi', 'malzeme_skt_gecmis', 'Temizlik için kullanılan malzemelerin son kullanım tarihlerinin geçmiş olması', 19, true),
  ('temizlik_yonetimi', 'personel_egitim_yetersiz', 'Temizlik personelinin yetersiz eğitim almış olması', 20, true),
  ('temizlik_yonetimi', 'bez_mop_temizlik_yetersiz', 'Temizlik sırasında kullanılan bezlerin ve mopların yeterince temizlenmemesi', 21, true),
  ('temizlik_yonetimi', 'malzeme_depo_yanlis', 'Temizlik sonrası malzeme ve ekipmanların yanlış şekilde depolanması', 22, true),
  ('temizlik_yonetimi', 'yuzey_nemli', 'Temizlik sonrasında yüzeylerin tamamen kuru olmaması, nemli bırakılması', 23, true),
  ('temizlik_yonetimi', 'yatak_degistirilmemis', 'Yatak takımının değiştirilmemesi', 24, true),
  ('temizlik_yonetimi', 'yatak_kirli_lekeli', 'Yatak takımının kirli / lekeli olması', 25, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
