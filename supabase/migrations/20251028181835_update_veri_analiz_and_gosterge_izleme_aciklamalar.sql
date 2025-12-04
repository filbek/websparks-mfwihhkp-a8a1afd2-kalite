/*
  # Veri Analiz Sonuçları & Göstergelerin İzlenmesi Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  Son iki kategori için Excel'den alınan güncel kısa açıklamaları yükler:
  - Veri Analiz Sonuçları: 1 açıklama
  - Göstergelerin İzlenmesi: 4 açıklama
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni açıklamaları ekler
  
  ## Not
  Bu son iki kategori ile tüm DOF kategorilerinin kısa açıklamaları tamamlanmış olacak
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value IN ('veri_analiz_sonuclari_kat', 'gostergelerin_izlenmesi');

-- Veri Analiz Sonuçları kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('veri_analiz_sonuclari_kat', 'esik_deger_sapma', 'Eşik Değerden Sapma', 1, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Göstergelerin İzlenmesi kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('gostergelerin_izlenmesi', 'calisan_gosterge_bilmiyor', 'Çalışanlar tarafından gösterge takibinin bilinmiyor olması', 1, true),
  ('gostergelerin_izlenmesi', 'calisan_gosterge_yapmiyor', 'Çalışanlar tarafından gösterge takibinin yapılmıyor olması', 2, true),
  ('gostergelerin_izlenmesi', 'hedef_sapma_aksiyon_yok', 'Hedefte sapma yaşanması sonucu aksiyon alınmaması', 3, true),
  ('gostergelerin_izlenmesi', 'yanlis_veri_gonderim', 'Yanlış/hatalı veri gönderiminin olması', 4, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
