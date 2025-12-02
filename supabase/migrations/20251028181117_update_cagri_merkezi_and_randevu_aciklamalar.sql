/*
  # Çağrı Merkezi Hizmeti & Randevu Hizmetleri Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  İki kategori için Excel'den alınan güncel kısa açıklamaları yükler:
  - Çağrı Merkezi Hizmeti: 10 açıklama
  - Randevu Hizmetleri: 12 açıklama
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni açıklamaları ekler
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value IN ('cagri_merkezi_hizmeti', 'randevu_hizmetleri');

-- Çağrı Merkezi Hizmeti kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('cagri_merkezi_hizmeti', 'nota_karsilik_aranmamis', 'Bırakılan nota karşılık aranmaması', 1, true),
  ('cagri_merkezi_hizmeti', 'personel_olumsuz_dil', 'Çağrı merkezi personelinin olumsuz veya profesyonellikten uzak bir dil kullanması', 2, true),
  ('cagri_merkezi_hizmeti', 'personel_egitim_yetersiz', 'Çağrı merkezi personelinin yeterli eğitim ve bilgiye sahip olmaması', 3, true),
  ('cagri_merkezi_hizmeti', 'sistem_hatali', 'Çağrı merkezi sisteminin hatalı çalışması (bağlantı kopması, sesin kesilmesi)', 4, true),
  ('cagri_merkezi_hizmeti', 'ulasim_yok', 'Çağrı merkezine ulaşamama', 5, true),
  ('cagri_merkezi_hizmeti', 'bilgilendirme_yonlendirme_yetersiz', 'Çağrı merkezinin bilgilendirme ve yönlendirmede yetersiz olması', 6, true),
  ('cagri_merkezi_hizmeti', 'not_iletilmemis', 'İlgili kişiye not iletilmemesi', 7, true),
  ('cagri_merkezi_hizmeti', 'telefon_bilgisiz_aktar', 'Telefonun bilgi verilmeden aktarılması', 8, true),
  ('cagri_merkezi_hizmeti', 'telefon_surekli_mesgul', 'Telefonun sürekli meşgul çalması', 9, true),
  ('cagri_merkezi_hizmeti', 'yanlis_doktor_randevu', 'Yanlış doktora randevu verilmesi', 10, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Randevu Hizmetleri kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('randevu_hizmetleri', 'yanlis_randevu', 'Hastaya yanlış randevu verilmesi', 1, true),
  ('randevu_hizmetleri', 'ayni_saat_farkli_hastane', 'Aynı saatte farklı iki hastaneye randevu verilmesi', 2, true),
  ('randevu_hizmetleri', 'bilgi_disi_iptal_degisik', 'Hastanın bilgisi dışında randevu iptali ve değişikliği', 3, true),
  ('randevu_hizmetleri', 'kontrol_randevu_yok', 'Kontrol için randevu verilmemesi', 4, true),
  ('randevu_hizmetleri', 'randevu_alamama', 'Randevu alamama', 5, true),
  ('randevu_hizmetleri', 'degisiklik_bildirim_yok', 'Randevu değişikliğinin hastaya bildirilmemesi', 6, true),
  ('randevu_hizmetleri', 'gun_saat_yanlis_bilgi', 'Randevu gün ve saati hakkında hastanın yanlış bilgilendirilmesi', 7, true),
  ('randevu_hizmetleri', 'kayit_islem_uzun', 'Randevu kayıt işlemlerinin uzun sürmesi', 8, true),
  ('randevu_hizmetleri', 'sure_kisa', 'Randevu sürelerinin kısa olması', 9, true),
  ('randevu_hizmetleri', 'sarkma_bekleme', 'Randevularda sarkma nedeniyle hastanın bekletilmesi', 10, true),
  ('randevu_hizmetleri', 'sistemde_gorunmuyor', 'Randevunun sistemde görülmemesi', 11, true),
  ('randevu_hizmetleri', 'sonuc_bekleme_uzun', 'Sonuç göstermek için uzun süre beklenilmesi', 12, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
