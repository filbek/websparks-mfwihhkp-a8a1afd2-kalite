-- Görüş-Öneri Kategorilerini Güncelleme Script'i
-- Mevcut kategorileri yeni kategorilerle değiştirir

-- 1. Mevcut kategorileri devre dışı bırak
UPDATE feedback_categories 
SET is_active = false 
WHERE is_active = true;

-- 2. Yeni kategorileri ekle
INSERT INTO feedback_categories (name, description, icon, color, is_active) VALUES
('İstek', 'Hastane ile ilgili talepler ve istekler', 'bi-send', '#3B82F6', true),
('Öneri', 'Hizmet iyileştirme önerileri', 'bi-lightbulb', '#10B981', true),
('Şikayet', 'Şikayet ve memnuniyetsizlik bildirimleri', 'bi-exclamation-triangle', '#EF4444', true),
('Teşekkür', 'Teşekkür ve takdir mesajları', 'bi-heart', '#F59E0B', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 3. Mevcut görüşleri yeni kategorilerle güncelle (isteğe bağlı)
-- Eğer mevcut görüşleri yeni kategorilere atamak isterseniz:
/*
UPDATE feedback_suggestions 
SET category_id = (SELECT id FROM feedback_categories WHERE name = 'Öneri' AND is_active = true)
WHERE category_id IN (SELECT id FROM feedback_categories WHERE is_active = false);

-- Veya mevcut görüşleri kategorisiz bırak:
UPDATE feedback_suggestions 
SET category_id = NULL
WHERE category_id IN (SELECT id FROM feedback_categories WHERE is_active = false);
*/
