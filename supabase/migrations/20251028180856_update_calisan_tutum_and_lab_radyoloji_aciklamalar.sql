/*
  # Çalışanların Tutum ve Davranışları & Laboratuvar ve Radyoloji Hizmetleri Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  İki kategori için Excel'den alınan güncel kısa açıklamaları yükler:
  - Çalışanların Tutum ve Davranışları: 10 açıklama
  - Laboratuvar ve Radyoloji Hizmetleri: 29 açıklama
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni açıklamaları ekler
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value IN ('calisanlarin_tutum_ve_davranislari', 'laboratuvar_ve_radyoloji_hizmetleri');

-- Çalışanların Tutum ve Davranışları kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('calisanlarin_tutum_ve_davranislari', 'yanlis_yonlendirme', 'Çalışanların hastaları yanlış yönlendirmesi', 1, true),
  ('calisanlarin_tutum_ve_davranislari', 'arasi_iletisim_sorun', 'Çalışan arası iletişim sorunu', 2, true),
  ('calisanlarin_tutum_ve_davranislari', 'hijyen_yetersiz', 'Çalışan hijyeninde yetersizlik', 3, true),
  ('calisanlarin_tutum_ve_davranislari', 'isg_dikkat_yok', 'Çalışan İş Sağlığı ve Güvenliği konusuna dikkat etmemesi', 4, true),
  ('calisanlarin_tutum_ve_davranislari', 'bilgilendirme_eksik_yanlis', 'Eksik/yanlış bilgilendirme', 5, true),
  ('calisanlarin_tutum_ve_davranislari', 'mahremiyet_sayginlik_dikkat_yok', 'Hastaların mahremiyetine ve saygınlığına dikkat edilmemesi', 6, true),
  ('calisanlarin_tutum_ve_davranislari', 'ilgi_eksik', 'İlgi eksikliği', 7, true),
  ('calisanlarin_tutum_ve_davranislari', 'ulasim_yok', 'İstenildiğinde çalışana ulaşılamaması', 8, true),
  ('calisanlarin_tutum_ve_davranislari', 'yetkin_degil', 'İşinde yetkin, becerikli olmama', 9, true),
  ('calisanlarin_tutum_ve_davranislari', 'uslup_rahatsizlik', 'Üslup ve tarzdan duyulan rahatsızlık', 10, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Laboratuvar ve Radyoloji Hizmetleri kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('laboratuvar_ve_radyoloji_hizmetleri', 'ornek_kayit_eksik_gec', 'Alınan örneğin kaydının eksik geç yapılması', 1, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'analitik_hata', 'Analitik hatalar', 2, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'baska_hasta_sonuc', 'Başka hastaya ait sonuçların verilmesi', 3, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'numune_tasima_sizinti', 'Biyolojik numunelerin taşınmasında sızıntı/dökülme', 4, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'cihaz_ariza', 'Cihaz arızası', 5, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'cekim_bekleme_uzun', 'Çekim için uzun süre beklenilmesi', 6, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'gizlilik_ihlal', 'Gizlilik ihlalleri (hastaya ait test sonuçlarının yanlış kişilere verilmesi)', 7, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'goruntu_net_degil', 'Görüntülerin net olmaması veya düşük çözünürlük', 8, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'asiri_radyasyon_maruz', 'Hasta veya personelin aşırı radyasyona maruz kalması', 9, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'yeniden_numune', 'Hastadan yeniden numune alınması', 10, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'rapor_gec_onay', 'Hastaya ait raporun geç onaylanması', 11, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'kimyasal_dokulme', 'Kimyasal madde dökülmesi veya sıçraması', 12, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'lab_cihaz_ariza', 'Laboratuvar cihazlarının arızalanması (otomatik analizör, mikroskop vb.)', 13, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'lab_hata_bildirim_yok', 'Laboratuvar hatalaranın olay bildiriminin yapılmaması', 14, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'numune_bekleme_uzun', 'Numune vermek için uzun süre bekleme', 15, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'postanalitik_hata', 'Postanalitik hatalar', 16, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'preanalitik_hata', 'Preanalitik hatalar', 17, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'radyasyon_doz_fazla', 'Radyasyon dozunun fazla verilmesi veya yanlış yönlendirilmesi', 18, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'radyasyon_egitim_eksik', 'Radyasyon güvenliği eğitim eksiklikleri', 19, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'radyasyon_koruma_yok', 'Radyasyon koruma önlemlerinin alınmaması (kurşun önlük, koruyucu gözlük vb.)', 20, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'radyasyon_sizinti', 'Radyasyon sızıntısı veya güvenlik ihlali (radyoloji odası kapalı olmadan çalışan cihaz)', 21, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'goruntu_yanlis_yorum', 'Radyolojik görüntülerin yanlış yorumlanması', 22, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'rapor_extra_ucret', 'Rapor için extra ücret talep edilmesi', 23, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'rapor_yanlis_dusunce', 'Raporun yanlış yazıldığı düşüncesi', 24, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'sonuc_sure_gec', 'Sonuçların belirtilen süre içerisinde verilmemesi', 25, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'test_onaysiz_yanlis_rapor', 'Testlerin onaylanmadan yapılması veya yanlış hastaya raporlanması', 26, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'cekim_yanlis', 'Yanlış çekim yapılması', 27, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'goruntuleme_yontem_yanlis', 'Yanlış görüntüleme yöntemi kullanımı (örneğin MR yerine BT)', 28, true),
  ('laboratuvar_ve_radyoloji_hizmetleri', 'hasta_hazirlik_yanlis', 'Yanlış test için hasta hazırlığı yapılması (örneğin açlık durumu, ilaç kullanımı vb.)', 29, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
