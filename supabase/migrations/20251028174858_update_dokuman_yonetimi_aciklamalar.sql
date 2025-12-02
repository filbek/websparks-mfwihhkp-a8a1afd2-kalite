/*
  # Doküman Yönetimi Kısa Açıklamalarını Güncelleme
  
  ## Açıklama
  Doküman Yönetimi kategorisi için Excel'den alınan güncel 9 kısa açıklamayı yükler.
  
  ## Değişiklikler
  1. Eski kısa açıklamaları deaktif eder
  2. Yeni 9 kısa açıklamayı ekler
*/

-- Önce eski verileri deaktif et
UPDATE dof_kisa_aciklamalar 
SET is_active = false 
WHERE kategori_value = 'dokuman_yonetimi';

-- Yeni Doküman Yönetimi kısa açıklamaları
INSERT INTO dof_kisa_aciklamalar (kategori_value, value, label, display_order, is_active) VALUES
  ('dokuman_yonetimi', 'adresleme_eksik', 'Adreslemelerinin yapılmaması/eksik yapılması', 1, true),
  ('dokuman_yonetimi', 'kontrolsuz_dokuman', 'Alanda kontrolsüz doküman kullanılması', 2, true),
  ('dokuman_yonetimi', 'form_numarasiz', 'Doküman numarasız formun kullanılması', 3, true),
  ('dokuman_yonetimi', 'sistem_erisim_yok', 'Doküman yönetim sistemine ulaşılamıyor olması', 4, true),
  ('dokuman_yonetimi', 'form_doldurma_hatali', 'Formun uygun şekilde doldurulmaması', 5, true),
  ('dokuman_yonetimi', 'guncel_olmayan_form', 'Güncel olmayan formun kullanılması', 6, true),
  ('dokuman_yonetimi', 'hasta_kayit_eksik', 'Hasta Kayıtlarında Eksiklik Olması', 7, true),
  ('dokuman_yonetimi', 'dokuman_egitim_yok', 'İlgili çalışanlara, dokümanlara yönelik gerekli eğitimler verilmemiş olması.', 8, true),
  ('dokuman_yonetimi', 'surec_dokuman_yok', 'Sürecin prosedür veya talimatta yazılı olmaması', 9, true)
ON CONFLICT (kategori_value, value) DO UPDATE SET 
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
