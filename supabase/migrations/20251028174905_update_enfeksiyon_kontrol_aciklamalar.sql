/*
  # Enfeksiyon Kontrol Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  Enfeksiyon Kontrol kategorisi için Excel'den alınan güncel 21 kısa açıklamayı yükler.
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni 21 kısa açıklamayı ekler
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value = 'enfeksiyon_kontrol';

-- Yeni Enfeksiyon Kontrol kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('enfeksiyon_kontrol', 'el_dezenfektan_malzeme_eksik', 'Bölümde el dezenfeksiyonu için kullanılan malzemenin eksik olması (sabun, dezenfektan, havlu vb)', 1, true),
  ('enfeksiyon_kontrol', 'dezenfeksiyon_kural_uyumsuz', 'Dezanfeksiyon kurallarına uyulmaması', 2, true),
  ('enfeksiyon_kontrol', 'duvar_tavan_nemli', 'Duvarların/tavanların nemli olması', 3, true),
  ('enfeksiyon_kontrol', 'kilavuz_semasi_yok', 'Enfeksiyon dezenfeksiyon kılavuzunun-el yıkama kılavuzu-5 endikasyon kuralı şemasının bulunmaması', 4, true),
  ('enfeksiyon_kontrol', 'enfeksiyon_faaliyet_bilinmiyor', 'Enfeksiyonlarla mücadeleye yönelik faaliyetler, hastanede  birim ve her sağlık çalışanı tarafından bilinmiyor olması.', 5, true),
  ('enfeksiyon_kontrol', 'canli_cicek', 'Hastaneye canlı çiçek alınması', 6, true),
  ('enfeksiyon_kontrol', 'solusyon_etiket_yok', 'Hazırlanan solüsyonların etiket bilgilerinin olmaması (SKT, içerik ..vb)', 7, true),
  ('enfeksiyon_kontrol', 'hemzemin_depolama', 'Hemzemin depolama yapılıyor olması', 8, true),
  ('enfeksiyon_kontrol', 'ilac_odasi_kisisel_esya', 'İlaç odalarında kişisel eşyaların bulundurulması', 9, true),
  ('enfeksiyon_kontrol', 'izolasyon_prosedur_uyumsuz', 'İzolasyon prosedürüne uygun davranılmaması', 10, true),
  ('enfeksiyon_kontrol', 'msds_rapor_yok', 'Kullanılan solüsyon/kimyasalların MSDS raporlarının olmaması', 11, true),
  ('enfeksiyon_kontrol', 'kimyasal_bilgi_yetersiz', 'Kullanılan solüsyon/kimyasalların özellikleri hakkında personelin bilgisinin olmaması', 12, true),
  ('enfeksiyon_kontrol', 'lavabo_alti_depolama', 'Lavabo altında depolama yapılıyor olması', 13, true),
  ('enfeksiyon_kontrol', 'partikul_clasman_uygunsuz', 'Partikül ölçüm sonuçlarında clasmanın uygun olmaması ve aksiyon alınmaması', 14, true),
  ('enfeksiyon_kontrol', 'partikul_olcum_yok', 'Partikül ölçümlerinin yapılmamış olmasıı', 15, true),
  ('enfeksiyon_kontrol', 'el_hijyen_egitim_yok', 'Sağlık çalışanlarına el hijyenini sağlamaya yönelik eğitimler verilmemiş olması.', 16, true),
  ('enfeksiyon_kontrol', 'standart_calisma_yok', 'Standardın gerektirdiği çalışmaların yapılmaması', 17, true),
  ('enfeksiyon_kontrol', 'sterilizasyon_kural_uyumsuz', 'Sterilizasyon kurallarına uygun davranılmaması', 18, true),
  ('enfeksiyon_kontrol', 'tadilat_enfeksiyon_onlem_yetersiz', 'Tesis kaynaklı tadilat, onarım, inşaat çalışmalarında enfeksiyonların önlenmesi çalışmalarının  yetersizliği.', 19, true),
  ('enfeksiyon_kontrol', 'yemek_acik_bekleme', 'Yemek üretim alanlarında gıdaların üzeri açık bekletilmesi', 20, true),
  ('enfeksiyon_kontrol', 'zemin_su_birikintisi', 'Zeminde su birikintisi olması', 21, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
