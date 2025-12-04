/*
  # Yangın Güvenliği Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  Yangın Güvenliği kategorisi için Excel'den alınan güncel 37 kısa açıklamayı yükler.
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni 37 kısa açıklamayı ekler
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value = 'yangin_guvenligi';

-- Yeni Yangın Güvenliği kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('yangin_guvenligi', 'acil_aydinlatma_calismiyor', 'Acil durum aydınlatmasının çalışmaması veya eksik olması', 1, true),
  ('yangin_guvenligi', 'acil_iletisim_calismiyor', 'Acil durum iletişim sistemlerinin çalışmaması', 2, true),
  ('yangin_guvenligi', 'acik_saft', 'Açık şaftların bulunuyor olması', 3, true),
  ('yangin_guvenligi', 'bina_disi_tedbir_yok', 'Bina dışı yangın güvenliği tedbirlerinin alınmaması', 4, true),
  ('yangin_guvenligi', 'bina_ici_plan_guncel_degil', 'Bina içi yangın güvenliği planlarının güncellenmemesi', 5, true),
  ('yangin_guvenligi', 'kablo_dagink', 'Elektrik kablolarının zeminde dağınık olması', 6, true),
  ('yangin_guvenligi', 'pano_oda_atil_malzeme', 'Elektrik pano odalarında atıl ve yanıcı malzemelerin bulunması', 7, true),
  ('yangin_guvenligi', 'pano_oda_isik_exproof_degil', 'Elektrik pano odalarında ışıklandırmaların exproof olmaması', 8, true),
  ('yangin_guvenligi', 'pano_oda_kilitsiz', 'Elektrik pano odalarının kilitli tutulmaması', 9, true),
  ('yangin_guvenligi', 'tupu_tarih_gecmis', 'Tarihi geçmiş yangın tüpü olması', 10, true),
  ('yangin_guvenligi', 'tek_cikis', 'Tek yangın çıkışının olması', 11, true),
  ('yangin_guvenligi', 'alarm_test_yok', 'Yangın alarm sisteminin test edilmemesi', 12, true),
  ('yangin_guvenligi', 'sensor_yanlis_konum', 'Yangın algılama sensörlerinin yanlış konumlandırılması', 13, true),
  ('yangin_guvenligi', 'cikis_kapi_yonetmelik_uygunsuz', 'Yangın çıkış kapısının yönetmeliğe uygun olmaması', 14, true),
  ('yangin_guvenligi', 'cikis_koridor_depolama', 'Yangın çıkış koridorunda/yangın merdiveninde depolama yapılması', 15, true),
  ('yangin_guvenligi', 'dolap_kontrol_yok', 'Yangın dolabı kontrolünün yapılmamış olması', 16, true),
  ('yangin_guvenligi', 'dolap_on_depolama', 'Yangın dolabı önünde depolama yapılması', 17, true),
  ('yangin_guvenligi', 'erken_uyari_calismiyor', 'Yangın erken uyarı sistemlerinin çalışmaması ya da arızalı olması', 18, true),
  ('yangin_guvenligi', 'egitim_yok', 'Yangın güvenliği eğitiminin verilmemiş olması', 19, true),
  ('yangin_guvenligi', 'ekipman_depo_yanlis', 'Yangın güvenliği ekipmanlarının yanlış depolanması', 20, true),
  ('yangin_guvenligi', 'ekipman_bakim_yok', 'Yangın güvenlik ekipmanlarının bakım ve kontrolünün yapılmaması', 21, true),
  ('yangin_guvenligi', 'prosedur_duyuru_yok', 'Yangın güvenlik prosedürlerinin çalışanlara duyurulmaması', 22, true),
  ('yangin_guvenligi', 'kapi_acik', 'Yangın kapılarının açık tutuluyor olması', 23, true),
  ('yangin_guvenligi', 'kapi_otomatik_kapanmiyor', 'Yangın kapılarının açıldıktan sonra kendiliğinden kapanmaması', 24, true),
  ('yangin_guvenligi', 'merdiven_bakirnsiz', 'Yangın merdivenlerinin bakımsız olması', 25, true),
  ('yangin_guvenligi', 'riskli_alan_sigara', 'Yangın riski taşıyan alanlarda sigara içilmesi', 26, true),
  ('yangin_guvenligi', 'periyodik_muayene_yok', 'Yangın sistemlerin yıllık periyodik muayenelerin yapılmaması', 27, true),
  ('yangin_guvenligi', 'sondurme_cihaz_uygunsuz_yer', 'Yangın söndürme cihazlarının uygun olmayan yerde bulundurulması', 28, true),
  ('yangin_guvenligi', 'sondurme_sistem_devre_disi', 'Yangın söndürme sistemlerinin devre dışı bırakılması', 29, true),
  ('yangin_guvenligi', 'sondurme_sistem_kapasite_yetersiz', 'Yangın söndürme sistemlerinin yetersiz kapasitede olması', 30, true),
  ('yangin_guvenligi', 'sondurme_on_engel', 'Yangın söndürücü önlerinde engellerin olması', 31, true),
  ('yangin_guvenligi', 'tatbikat_yok', 'Yangın tatbikatının yapılmamış olması', 32, true),
  ('yangin_guvenligi', 'tupu_etiket_uygunsuz', 'Yangın tüpü üzerindeki etiketlemelerin uygun olmaması', 33, true),
  ('yangin_guvenligi', 'tupu_sabit_degil', 'Yangın tüpünün sabitlenmemiş olması', 34, true),
  ('yangin_guvenligi', 'yonlendirme_eksik', 'Yangın yönlendirmelerinin eksik/hatalı olması', 35, true),
  ('yangin_guvenligi', 'yanici_depo_hatali', 'Yanıcı maddelerin hatalı depolanması', 36, true),
  ('yangin_guvenligi', 'yanici_etiket_uygunsuz', 'Yanıcı malzemelerin ve kimyasalların yangın güvenliği yönergelerine uygun şekilde etiketlenmemesi', 37, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
