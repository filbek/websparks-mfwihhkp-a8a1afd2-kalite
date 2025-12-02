/*
  # Cihaz ve Ekipman Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  Cihaz ve Ekipman kategorisi için Excel'den alınan güncel 34 kısa açıklamayı yükler.
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni 34 kısa açıklamayı ekler
  
  ## Notlar
  - Tüm açıklamalar Excel'deki liste ile birebir eşleşir
  - Display order liste sırasına göredir
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value = 'cihaz_ve_ekipman';

-- Yeni Cihaz ve Ekipman kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('cihaz_ve_ekipman', 'ariza_uyari_yok', 'Arıza durumunda cihaz kullanım dışı bırakılarak ,cihaz üzerinde arıza uyarısı bulunmasının sağlanmamış olması.', 1, true),
  ('cihaz_ve_ekipman', 'arizali_etiket_yok', 'Arızalı ekipmanların arızalı olarak etiketlenmemesi.', 2, true),
  ('cihaz_ve_ekipman', 'arizali_uygunsuz_depo', 'Arızalı ekipmanların uygunsuz depolanması.', 3, true),
  ('cihaz_ve_ekipman', 'ariza_sure_uzun', 'Arızanın uygun sürede giderilememesi.', 4, true),
  ('cihaz_ve_ekipman', 'kilavuz_eksik', 'Bakım ve kullanım kılavuzunun alanda olmaması yada anlaşılır olmaması.', 5, true),
  ('cihaz_ve_ekipman', 'bakim_zamaninda_degil', 'Bakımların zamanında yapılmaması.', 6, true),
  ('cihaz_ve_ekipman', 'kullanici_bilgi_yetersiz', 'Cihaz ya da ekipmanla ilgili kullanıcının bilgisinin yetersiz olması.', 7, true),
  ('cihaz_ve_ekipman', 'kullanici_egitim_yok', 'Cihaz ya da ekipmanla ilgili kullanıcıya eğitim verilmemiş olması.', 8, true),
  ('cihaz_ve_ekipman', 'yonetim_dosya_eksik', 'Cihaz yönetim dosyalarının eksik olması (laboratuar cihazları için).', 9, true),
  ('cihaz_ve_ekipman', 'transfer_prosedur_uyumsuz', 'Cihaz/ekipman transfer ve teslimlerinde ilgili prosedürlere uyulmaması.', 10, true),
  ('cihaz_ve_ekipman', 'sicaklik_nem_uygunsuz', 'Cihaz/ekipmanın bulunduğu alanın sıcaklık/nem değerlerinin uygun olmaması.', 11, true),
  ('cihaz_ve_ekipman', 'sicaklik_nem_takip_yok', 'Cihaz/ekipmanın bulunduğu alanın sıcaklık/nem takibinin yapılmaması.', 12, true),
  ('cihaz_ve_ekipman', 'cihaz_yetersiz', 'Cihaz/ekipmanın yetersiz olması/ eksikliği.', 13, true),
  ('cihaz_ve_ekipman', 'eksternal_kk_cift_seviye_yok', 'Cihazın eksternal kalite kontrolünün çift seviye yapılmamış (normal/patolojik) olması.', 14, true),
  ('cihaz_ve_ekipman', 'eksternal_kk_zaman_uygunsuz', 'Cihazın eksternal kalite kontrolünün planlanan zamanda yapılmamış olması.', 15, true),
  ('cihaz_ve_ekipman', 'internal_kk_cift_seviye_yok', 'Cihazın internal kalite kontrolünün çift seviye yapılmamış (normal/patolojik) olması.', 16, true),
  ('cihaz_ve_ekipman', 'internal_kk_zaman_uygunsuz', 'Cihazın internal kalite kontrolünün planlanan zamanda yapılmamış olması.', 17, true),
  ('cihaz_ve_ekipman', 'cihaz_arizali', 'Cihazın/ekipmanın arızalı olması.', 18, true),
  ('cihaz_ve_ekipman', 'cihaz_etiket_yok', 'Cihazların etiketlenmemiş olması.', 19, true),
  ('cihaz_ve_ekipman', 'depo_temizlik_yetersiz', 'Depoların temizliği, düzenli aralıklarla yapılmamış olması.', 20, true),
  ('cihaz_ve_ekipman', 'kalibrasyon_etiket_hatali', 'Hatalı kalibrasyon etiketinin olması.', 21, true),
  ('cihaz_ve_ekipman', 'havalandirma_temizlik_yok', 'Havalandırma menfezlerinin temizlenmemesi.', 22, true),
  ('cihaz_ve_ekipman', 'kalibrasyon_sonuc_bilinmiyor', 'Kalibrasyon ve bakım sonuçlarının kullanıcılar tarafından bilinmiyor olması.', 23, true),
  ('cihaz_ve_ekipman', 'kalibrasyon_zamaninda_degil', 'Kalibrasyonların zamanında yapılmaması.', 24, true),
  ('cihaz_ve_ekipman', 'kalibrasyon_rapor_yok', 'Kalibrasyonu yapılan tıbbi cihazların test, kontrol ve kalibrasyon raporu bulunmayışı,', 25, true),
  ('cihaz_ve_ekipman', 'kk_sonuc_uygunsuz_aksiyon_yok', 'Kalite kontrol sonuçlarının uygun olmaması ve aksiyon alınmaması.', 26, true),
  ('cihaz_ve_ekipman', 'malzeme_depo_siniflandirma_yok', 'Malzemelerin cinslerine göre depolanmaması.', 27, true),
  ('cihaz_ve_ekipman', 'transfer_onlem_yok', 'Malzemelerin depolardan birimlere  transferi sırasında gerçekleşebilecek kırılma, yırtılma, dökülme gibi durumlara karşı önlemler alınmamış olması.', 28, true),
  ('cihaz_ve_ekipman', 'transfer_egitim_yok', 'Malzemelerin transferini gerçekleştirecek çalışanlara güvenli transfer ile ilgili eğitim verilmemiş olması.', 29, true),
  ('cihaz_ve_ekipman', 'radyoaktif_kayit_yok', 'Radyoaktif maddelerin radyoaktivite değeri ve ölçüm tarihi kayıt  edilmemiş olması.', 30, true),
  ('cihaz_ve_ekipman', 'tehlikeli_madde_envanter_eksik', 'Tehlikeli maddelerin envanterinde, Saklama koşulları,Etkileşime girdiği maddeler,Temas halinde yapılacaklar,  Kullanıldığı ve depolandığı yerler,Taşıma şekli,İmha yöntemleri,Tehlikeli madde sınıfını gösteren simgelerin bulunmaması.', 31, true),
  ('cihaz_ve_ekipman', 'tehlikeli_madde_bilgi_yetersiz', 'Tehlikeli maddenin ismi, markası, etken maddesi, tipi (toz, kristal vb.), kullanım şekli ve miadı gösteren bigilerin yetersizliği.', 32, true),
  ('cihaz_ve_ekipman', 'tibbi_cihaz_envanter_sistem_yok', 'Tıbbi cihazların envanteri Bakanlıkça tanımlanan sistem üzerinde görülmemesi.', 33, true),
  ('cihaz_ve_ekipman', 'uygunsuz_cihaz_geri_cekim_kural_yok', 'Uygunsuz Cihaz/malzemelerin geri çekilmesi, muhafazası ve iade şartları ile ilgili kuralların bilinmemesi.', 34, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
