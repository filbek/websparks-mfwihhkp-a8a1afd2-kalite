/*
  # Hastane Donanımı (Oda Dahil) ve Fiziksel Sorunlar & Yiyecek ve İçecek Hizmetleri Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  İki kategori için Excel'den alınan güncel kısa açıklamaları yükler:
  - Hastane Donanımı (Oda Dahil) ve Fiziksel Sorunlar: 25 açıklama
  - Yiyecek ve İçecek Hizmetleri: 16 açıklama
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni açıklamaları ekler
  
  ## Not
  Kategori value düzeltildi: yiyecek_icecek_hizmetleri (yiyecek_ve_icecek_hizmetleri DEĞİL)
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value IN ('hastane_donanimi_ve_fiziksel_sorunlar', 'yiyecek_icecek_hizmetleri');

-- Hastane Donanımı (Oda Dahil) ve Fiziksel Sorunlar kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'acil_cikis_isaret_yetersiz', 'Acil çıkış işaretlerinin kaybolması veya yetersiz olması', 1, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'asansor_arizali', 'Asansörün arızalı olması', 2, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'asansor_uzun_bekleme', 'Asansörün uzun süre beklenmesi', 3, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'aydinlatma_yetersiz', 'Aydınlatmanın yetersiz olması', 4, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'sedye_sandalye_yetersiz', 'Bölümde yeterli sayıda sedye veya tekerlekli sandalye bulunmaması', 5, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'duvar_hasar_kirik', 'Duvarda hasar/kırık olması', 6, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'duvar_boya_ihtiyac', 'Duvarların boya ihtiyacı olması', 7, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'priz_eksik_guvenli_degil', 'Elektrik prizlerinin eksik veya güvenli olmayan şekilde yerleştirilmesi', 8, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'ortak_alan_yetersiz', 'Emzirme odası , mescit , bekleme salonu gibi ortak kullanım alanlarının yetersiz olması', 9, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'genel_temizlik_yetersiz', 'Genel temizlik hizmetlerinin yetersizliği (koridorlar, odalar, tuvaletler vb.)', 10, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'havalandirma_calismaz', 'Havalandırma sisteminin çalışmaması', 11, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'hemsire_cagri_calismaz', 'Hemşire çağrı zilinin çalışmaması', 12, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'internet_telefon_aksaklik', 'İnternet, cep telefonu kullanımı gibi durumlarda aksaklık yaşanması', 13, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'merdiven_asansor_rampa_hasar', 'Merdiven, asansör veya rampaların fiziksel hasar alması', 14, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'su_sizinti', 'Odada/alanda su sızıntısı olması', 15, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'ekipman_konforsuz', 'Odadaki ekipmanın konforsuz olması', 16, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'ekipman_yetersiz_bakimsiz', 'Odadaki ekipmanın yetersiz / bakımsız /kırık olması', 17, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'ekipman_calismaz', 'Odadaki ekipmanların çalışmaması', 18, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'klima_tv_calismaz', 'Odadaki klimanın veya televizyonun çalışmaması', 19, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'sicaklik_istenen_degil', 'Odanın / bölümün istenen sıcaklıkta olmaması', 20, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'priz_topraklama_etiket_yok', 'Prizlerde topraklama etiketinin bulunmaması', 21, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'sessiz_ortam_yok', 'Sessiz ortamın sağlanamaması', 22, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'su_sebil_yok', 'Su sebillerinin olmaması', 23, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'su_isinma_sogutma_ariza', 'Su, ısınma, soğutma sistemlerinin arızalanması', 24, true),
  ('hastane_donanimi_ve_fiziksel_sorunlar', 'zemin_kirik', 'Zeminin kırık olması', 25, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Yiyecek ve İçecek Hizmetleri kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('yiyecek_icecek_hizmetleri', 'bos_tepsi_alinmamis', 'Boş tepsilerin alınmaması', 1, true),
  ('yiyecek_icecek_hizmetleri', 'egitim_eksik_hatali_servis', 'Eğitim eksikliği nedeniyle hatalı servis yapılması', 2, true),
  ('yiyecek_icecek_hizmetleri', 'skt_gecmis', 'Gıdaların son kullanma tarihlerinin geçmesi', 3, true),
  ('yiyecek_icecek_hizmetleri', 'diyet_liste_ulasmamis', 'Güncel diyet listesinin mutfağa ulaşmaması', 4, true),
  ('yiyecek_icecek_hizmetleri', 'yemek_birakilip_kontrol_yok', 'Hasta yatağına yemek bırakılıp kontrol edilmemesi', 5, true),
  ('yiyecek_icecek_hizmetleri', 'izolasyon_onlem_yok', 'İzolasyondaki hastaya uygun önlem alınmadan yemek dağıtılması', 6, true),
  ('yiyecek_icecek_hizmetleri', 'refakatci_yemek_gelmemis', 'Refakatçi yemeğinin gelmemesi', 7, true),
  ('yiyecek_icecek_hizmetleri', 'yabanci_cisim', 'Yemeğin içinden yabancı cisim çıkması', 8, true),
  ('yiyecek_icecek_hizmetleri', 'yemek_yanlis_gelmis', 'Yemeğin yanlış gelmesi', 9, true),
  ('yiyecek_icecek_hizmetleri', 'kap_tepsi_kirli', 'Yemek kaplarının/tepsilerinin kirli olması', 10, true),
  ('yiyecek_icecek_hizmetleri', 'lezzet_kotu', 'Yemek lezzetinin kötü olması', 11, true),
  ('yiyecek_icecek_hizmetleri', 'secenek_az', 'Yemek seçeneğinin az olması', 12, true),
  ('yiyecek_icecek_hizmetleri', 'tabak_catal_bicak_kirli', 'Yemek servisi sırasında tabakların veya çatal bıçak takımlarının kirli olması', 13, true),
  ('yiyecek_icecek_hizmetleri', 'yemek_gec_gelmis', 'Yemeklerin geç gelmesi', 14, true),
  ('yiyecek_icecek_hizmetleri', 'yemek_soguk_gelmis', 'Yemeklerin soğuk gelmesi', 15, true),
  ('yiyecek_icecek_hizmetleri', 'servis_eksik', 'Yiyecek – içecek servisinde eksiklik olması', 16, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
