/*
  # Atık Yönetimi Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  Atık Yönetimi kategorisi için Excel'den alınan güncel 22 kısa açıklamayı yükler.
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni 22 kısa açıklamayı ekler
  
  ## Notlar
  - Tüm açıklamalar Excel'deki liste ile birebir eşleşir
  - Display order alfabetik sıraya göre değil, liste sırasına göredir
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value = 'atik_yonetimi';

-- Yeni Atık Yönetimi kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('atik_yonetimi', 'atik_konteyneri_kilitsiz', 'Atık konteynerının kapısının kilitli olmaması.', 1, true),
  ('atik_yonetimi', 'atik_kovasi_etiketlenmemis', 'Atık kovalarının uygun atık koduna göre etiketlenmemesi.', 2, true),
  ('atik_yonetimi', 'atik_kovasi_kapak_acik', 'Atık kovasının kapağının açık olması.', 3, true),
  ('atik_yonetimi', 'atik_kutusu_isaret_yok', 'Atık kutularının üzerinde uluslararası uyarı işaretleri ve atığı tanımlayan ifade bulunmaması.', 4, true),
  ('atik_yonetimi', 'atik_poseti_tanimlayici_yok', 'Atık poşetlerinin hangi birimden toplandığına dair tanımlayıcı bilgi bulunmaması.', 5, true),
  ('atik_yonetimi', 'asansor_temizlik_yok', 'Atık sonrası asansörlerin temizliğinin yapılmaması.', 6, true),
  ('atik_yonetimi', 'atik_tasima_uygunsuz_giysi', 'Atık taşınırken politikalara uygun giyinilmemesi.', 7, true),
  ('atik_yonetimi', 'atik_toplama_eksik_ekipman', 'Atık toplama esnasında personelin eksik ekipman kullanımı.', 8, true),
  ('atik_yonetimi', 'atik_yonetim_kurallari_uyumsuzluk', 'Atık yönetim kurallarına uyulmaması.', 9, true),
  ('atik_yonetimi', 'atik_ayrim_yonlendirme_eksik', 'Atıkların ayrımı ile ilgili yönlendirmelerin eksikliği.', 10, true),
  ('atik_yonetimi', 'gecici_depo_uygunsuz', 'Atıkların bekletildiği geçici depo koşullarının uygun olmaması.', 11, true),
  ('atik_yonetimi', 'kaza_onlem_yetersiz', 'Atıkların toplanması ve taşınması sırasında oluşabilecek kazalara karşı alınacak önlemlerin yetersizliği.', 12, true),
  ('atik_yonetimi', 'atik_uygunsuz_alan', 'Atıkların uygun alanda bekletilmemesi.', 13, true),
  ('atik_yonetimi', 'yanlis_cop_kutusu', 'Atıkların yanlış çöp kutusuna atılmış olması.', 14, true),
  ('atik_yonetimi', 'atik_zamaninda_bosaltilmama', 'Atıkların zamanında boşaltılmaması.', 15, true),
  ('atik_yonetimi', 'bolum_atik_kutusu_yetersiz', 'Bölüm bazında oluşan atık türlerine göre uygun atık kutuları bulunmaması.', 16, true),
  ('atik_yonetimi', 'atik_miktar_kayit_yok', 'Oluşan, taşınan ve bertaraf edilen tıbbi atık miktarının kayıt altına alınmaması.', 17, true),
  ('atik_yonetimi', 'personel_bilgi_yetersiz', 'Personelin atık yönetimi konusunda bilgisinin yetersiz olması.', 18, true),
  ('atik_yonetimi', 'sharp_box_doluluk_uygunsuz', 'Sharp box, atık bidonları ya da kovalarının doluluk oranlarının uygun olmaması.', 19, true),
  ('atik_yonetimi', 'tehlikeli_madde_saklama_uygunsuz', 'Tehlikeli maddelerin saklanma koşullarının uygun olmaması.', 20, true),
  ('atik_yonetimi', 'tehlikeli_madde_imha_uygunsuz', 'Tehlikeli maddelerin uygun koşullarda imha edilmemesi (anlaşmalı firmaya teslim edilmemesi).', 21, true),
  ('atik_yonetimi', 'atik_personel_saglik_kontrol', 'Tıbbi atık yönetimiyle ilgili personelin periyodik olarak sağlık kontrolünden geçirilmesi,(atık miktarının kayıt altına alınması esastır.)', 22, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
