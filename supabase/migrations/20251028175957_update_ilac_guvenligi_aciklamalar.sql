/*
  # İlaç Güvenliği Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  İlaç Güvenliği kategorisi için Excel'den alınan güncel 37 kısa açıklamayı yükler.
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni 37 kısa açıklamayı ekler
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value = 'ilac_guvenligi';

-- Yeni İlaç Güvenliği kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('ilac_guvenligi', 'allerjik_reaksiyon', 'Allerjik reaksiyon', 1, true),
  ('ilac_guvenligi', 'buzdolabi_yanlis_ilac', 'Buzdolabında yanlış ilaçların saklanması', 2, true),
  ('ilac_guvenligi', 'crash_card_kilitsiz', 'Crash cardların kilitlenmemiş olması', 3, true),
  ('ilac_guvenligi', 'depo_sicaklik_nem_kontrolsuz', 'Depolama alanlarının sıcaklık ve nem değerleri kontrol altında tutulmaması.', 4, true),
  ('ilac_guvenligi', 'eczane_disi_kontrol_yok', 'Eczane dışı alanların ilaç kontrollerinin düzenli olarak yapılmaması', 5, true),
  ('ilac_guvenligi', 'order_eczaci_onay_yok', 'Eczaneden gelen orderlarında eczacı onayı olmaması', 6, true),
  ('ilac_guvenligi', 'order_hekim_onay_yok', 'Eczaneye gönderilen ilaç orderlarında hekim onayı olmaması', 7, true),
  ('ilac_guvenligi', 'iade_surec_uygunsuz', 'Eczaneye iade edilen ilaçların teslimine ilişkin süreçlerdeki uygunsuzluk.', 8, true),
  ('ilac_guvenligi', 'ehu_onay_gereken_onaysiz', 'EHU onayı gerektiren antibiyotiklerin onaysız kullanımı', 9, true),
  ('ilac_guvenligi', 'enjektorlu_ilac_bekletme', 'Enjektöre çekilmş ilaçların bekletilmesi', 10, true),
  ('ilac_guvenligi', 'hasta_ilac_kontrol_uygunsuz', 'Hasta beraberinde gelen ilaçların kontrolü prosedürüne uygunsuzluk.', 11, true),
  ('ilac_guvenligi', 'buzdolabi_yiyecek', 'İlaç buzdolabında yiyecek bulundurulması', 12, true),
  ('ilac_guvenligi', 'ilac_depo_fazla_malzeme', 'İlaç depolarında ve ilaç için ayrılmış buzdolaplarında ilaç niteliğindeki malzemeler ve aşı haricinde malzeme bulundurulması.', 13, true),
  ('ilac_guvenligi', 'ilac_dolap_acik', 'İlaç dolabının erişime açık şekilde bırakılması', 14, true),
  ('ilac_guvenligi', 'order_doz_yok', 'İlaç orderlarında doz bilgisi yazılmaması', 15, true),
  ('ilac_guvenligi', 'order_verilis_yolu_yok', 'İlaç orderlarında veriliş yolu bilgisi yazılmaması', 16, true),
  ('ilac_guvenligi', 'skt_belli_degil', 'İlaç son kullanım tarihlerinin belli olmaması', 17, true),
  ('ilac_guvenligi', 'etken_madde_order', 'İlaç ticari ismi yerine etken madde yazılarak order edilmesi', 18, true),
  ('ilac_guvenligi', 'ticari_isim_kisaltma', 'İlaç ticari isminin kısaltılarak yazılması', 19, true),
  ('ilac_guvenligi', 'ilac_yerlesim_hatali', 'İlaç yerleşiminin hatalı olması', 20, true),
  ('ilac_guvenligi', 'ilac_etiket_yok', 'İlaçların etiketlenmemiş olması', 21, true),
  ('ilac_guvenligi', 'stok_seviye_belirsiz', 'İlaçların minimum stok seviyesi, kritik stok seviyesi, maksimum stok seviyesi belirlenmemiş olması.', 22, true),
  ('ilac_guvenligi', 'saklama_kosul_uygunsuz', 'İlaçların saklama koşulllarının uygun olmaması (sıcaklık ve nem değerleri)', 23, true),
  ('ilac_guvenligi', 'kirli_temiz_oda_kilitsiz', 'Kirli ve temiz odaların kitli olmaması', 24, true),
  ('ilac_guvenligi', 'luzum_endikasyon_yok', 'Lüzum hali yazılan orderlarda endikasyon belirtilmemesi', 25, true),
  ('ilac_guvenligi', 'narkotik_guvenlik_yetersiz', 'Narkotik/psikotrop ilaçların güvenliğinin yeterince sağlanmaması', 26, true),
  ('ilac_guvenligi', 'narkotik_kilitsiz', 'Narkotik/psikotrop ilaçların kilit altında olmaması', 27, true),
  ('ilac_guvenligi', 'narkotik_form_eksik', 'Narkotik-Psikotrop İlaç Uygulama Takip Formunun Eksik Doldurulması.', 28, true),
  ('ilac_guvenligi', 'sozel_order_uygunsuz', 'Sözel orderların politikalara uygun verilmemesi/onaylanmaması', 29, true),
  ('ilac_guvenligi', 'sulandirilan_saklama_uygunsuz', 'Sulandırıldıktan, açıldıktan veya hazırlandıktan sonra muhafaza şartları uygun olmayan veya saklama süresi dolan ilaçların imha', 30, true),
  ('ilac_guvenligi', 'yarim_ampul_surec_bilinmiyor', 'Tedavi sonrası yarım kalan ampullerin kullanımı ve imhası sürecinin bilinmemesi.', 31, true),
  ('ilac_guvenligi', 'order_karalama_tpex', 'Yazılan ilaç orderlarında karalama/tpex kullanımı', 32, true),
  ('ilac_guvenligi', 'order_okunamaz', 'Yazılan ilaç orderlarının okunaklı olmaması', 33, true),
  ('ilac_guvenligi', 'yri_narkotik_kemo_sozel', 'YRİ,narkotik ve kemoterapi ilaçlarının sözel order olarak verilmesi', 34, true),
  ('ilac_guvenligi', 'yri_order_ampul', 'Yüksek riskli ilaç orderlarının doz yerine ampul olarak order edilmesi', 35, true),
  ('ilac_guvenligi', 'yri_etiketsiz', 'Yüksek riskli ilaçların etiketsiz olması', 36, true),
  ('ilac_guvenligi', 'yri_kilitsiz', 'Yüksek riskli ilaçların kilit altında olmaması', 37, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
