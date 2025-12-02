/*
  # Otopark Hizmetleri & Hasta Güvenliği Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  İki kategori için Excel'den alınan güncel kısa açıklamaları yükler:
  - Otopark Hizmetleri: 9 açıklama
  - Hasta Güvenliği: 33 açıklama
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni açıklamaları ekler
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value IN ('otopark_hizmetleri', 'hastane_guvenligi');

-- Otopark Hizmetleri kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('otopark_hizmetleri', 'acil_alan_kapatilmis', 'Acil alanların (ambulans yolu, yangın çıkışı) kapatılması', 1, true),
  ('otopark_hizmetleri', 'engelli_alan_izinsiz_park', 'Engelli alanına izinsiz park', 2, true),
  ('otopark_hizmetleri', 'bariyer_otomat_ariza', 'Otopark bariyer/otomat sistemlerinin arızası', 3, true),
  ('otopark_hizmetleri', 'personel_uslup_rahatsizlik', 'Otopark personelinin üslup ve tarzından rahatsızlık duyulması', 4, true),
  ('otopark_hizmetleri', 'vale_memnun_degil', 'Otopark/vale hizmetlerinden memnun kalınmaması', 5, true),
  ('otopark_hizmetleri', 'vale_ucret_pahali', 'Otopark/vale ücretinin pahalı olması', 6, true),
  ('otopark_hizmetleri', 'otopark_ucretli', 'Otoparkın ücretli olması', 7, true),
  ('otopark_hizmetleri', 'arac_hasar', 'Otoparkta aracın hasar görmesi', 8, true),
  ('otopark_hizmetleri', 'yer_yok', 'Otoparkta yer olmaması', 9, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Hasta Güvenliği (Hastane Güvenliği) kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('hastane_guvenligi', 'acil_ekipman_yanlis_yerlestirme', 'Acil durum ekipmanlarının yanlış yerleştirilmesi veya erişiminin engellenmesi', 1, true),
  ('hastane_guvenligi', 'acil_kacis_saglanmaz', 'Acil Durumlarda Kaçışın Sağlanamaması', 2, true),
  ('hastane_guvenligi', 'agir_malzeme_ust_raf', 'Ağır Malzemelerin Üst Raflarda İstiflenmesi', 3, true),
  ('hastane_guvenligi', 'atik_ayristirma_uyunsuz', 'Atıkların kaynağında ayrıştırılması ilkesine uyunsuzluk.', 4, true),
  ('hastane_guvenligi', 'banyo_tuvalet_kayma_onlem_yok', 'Banyo ve tuvaletlerde kayma riskine karşı önlem alınmaması', 5, true),
  ('hastane_guvenligi', 'calisan_guvenlik_bilgi_yetersiz', 'Çalışanların kişisel güvenlik önlemleri konusunda yetersiz bilgilendirilmesi', 6, true),
  ('hastane_guvenligi', 'calisan_psikoloji_izlenme_yok', 'Çalışanların psikolojik sağlıklarının izlenmemesi ve bu konuda destek sağlanmaması', 7, true),
  ('hastane_guvenligi', 'dolap_sabit_degil', 'Çalışma alanlarında dolapların sabit olmaması', 8, true),
  ('hastane_guvenligi', 'yanici_madde_uygunsuz_depo', 'Çalışma alanlarında yanıcı maddelerin uygunsuz şekilde depolanması', 9, true),
  ('hastane_guvenligi', 'aydinlatma_yetersiz', 'Çalışma alanlarında yeterli aydınlatmanın olmaması', 10, true),
  ('hastane_guvenligi', 'sandalye_ergonomi_uygun_degil', 'Çalışma Sandalyelerin Ergonomi Koşullara Uygun Olmaması', 11, true),
  ('hastane_guvenligi', 'saglik_guvenlik_isaret_eksik', 'Eksik sağlık ve güvenlik işaretlerinin olmaması', 12, true),
  ('hastane_guvenligi', 'elektrik_kablo_duzensiz', 'Elektrik panolarının üzerindeki kabloların düzensiz ve dağınık olması', 13, true),
  ('hastane_guvenligi', 'elektrik_tesisat_guvenli_degil', 'Elektrik tesisatının güvenli olmayan bir şekilde döşenmesi (örneğin, yanlış kablo kullanımı veya zayıf bağlantılar)', 14, true),
  ('hastane_guvenligi', 'raf_sistem_bakim_yok', 'Endüstriyel Raf Sistemlerinin Yıllık Bakımlarının Olmaması', 15, true),
  ('hastane_guvenligi', 'ergonomi_yetersiz', 'Ergonomi Koşulların Yetersiz Olması', 16, true),
  ('hastane_guvenligi', 'goz_solusyon_yok', 'Göz Solüsyonunun Bulunmaması', 17, true),
  ('hastane_guvenligi', 'gurultu_limit_ustu', 'Gürültü seviyesinin güvenlik limitlerinin üzerinde olması', 18, true),
  ('hastane_guvenligi', 'giris_cikis_guvenlik_yok', 'Hastane Giriş - Çıkışların Güvenliğin Sağlanmaması', 19, true),
  ('hastane_guvenligi', 'dinlenme_alan_yetersiz', 'İşyerinde yeterli dinlenme alanlarının olmaması', 20, true),
  ('hastane_guvenligi', 'sicaklik_soguk_onlem_yok', 'İşyerinde yüksek sıcaklık veya soğuk hava koşullarına karşı uygun önlemlerin alınmaması', 21, true),
  ('hastane_guvenligi', 'priz_kirik', 'Kırık elektrik prizlerin olması', 22, true),
  ('hastane_guvenligi', 'koruyucu_ekipman_eksik', 'Koruyucu ekipmanların eksik veya uygunsuz kullanımı (örneğin, eldiven, koruyucu gözlük, baret)', 23, true),
  ('hastane_guvenligi', 'makine_muhafaza_eksik', 'Makine ve ekipmanların koruyucu muhafazalarının eksik veya hasarlı olması', 24, true),
  ('hastane_guvenligi', 'pasli_ekipman', 'Paslı ekipmanların alanlarda bulunması', 25, true),
  ('hastane_guvenligi', 'raf_topraklama_yok', 'Raf Sistemlerinin Topraklamalarının Yapılmaması', 26, true),
  ('hastane_guvenligi', 'raf_sabit_degil', 'Rafların Sabitli Olmaması', 27, true),
  ('hastane_guvenligi', 'saglik_guvenlik_isaret_yok', 'Sağlık Güvenlik İşaretlerin Olmaması/Sökülmesi', 28, true),
  ('hastane_guvenligi', 'siginak_uygun_kullanilmaz', 'Sığınakların uygun olarak kullanılmaması', 29, true),
  ('hastane_guvenligi', 'su_depo_kapak_kilitsiz', 'Su depolarında kapakların kilitsiz olması', 30, true),
  ('hastane_guvenligi', 'su_depo_elektrik_uygunsuz', 'Su depolarında uygunsuz konumlandırılan elektrik panolarının bulunması', 31, true),
  ('hastane_guvenligi', 'su_depo_temizlik_yok', 'Su depolarının temizliğinin/kontrollerinin yapılmamış olması', 32, true),
  ('hastane_guvenligi', 'yangin_tatbikat_yok', 'Yangın tatbikatlarının veya acil durum simülasyonlarının yapılmaması', 33, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
