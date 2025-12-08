-- ============================================================================
-- DÖF GÖRÜNÜRLÜK KISITLAMALARI
-- ============================================================================

ALTER TABLE dofs ENABLE ROW LEVEL SECURITY;

-- Mevcut SELECT policy'lerini temizle (çatışmayı önlemek için)
DROP POLICY IF EXISTS "Dofs are viewable by everyone" ON dofs;
DROP POLICY IF EXISTS "Dofs are viewable by assigned/reporter users" ON dofs;
DROP POLICY IF EXISTS "Users can view all dofs" ON dofs;
DROP POLICY IF EXISTS "Dofs visibility restricted" ON dofs;

-- Yeni DÖF Policy
CREATE POLICY "Dofs visibility restricted" ON dofs
  FOR SELECT
  USING (
    -- Kullanıcı DÖF'ü açan kişiyse (dofu_acan veya reporter_id)
    auth.uid() = reporter_id OR
    auth.uid() = dofu_acan OR
    -- Kullanıcıya atanmışsa
    auth.uid() = assigned_to OR
    -- Kullanıcı CC listesinde ise
    auth.uid() = ANY(cc_users) OR
    -- Kullanıcı yetkili bir roldeyse (Admin, Merkez Kalite, Şube Kalite)
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND 
      ('admin' = ANY(role) OR 'merkez_kalite' = ANY(role) OR 'sube_kalite' = ANY(role))
    )
  );

-- ============================================================================
-- KANBAN (İŞ TAKİBİ) GÖRÜNÜRLÜK KISITLAMALARI
-- ============================================================================

-- 1. cards tablosuna created_by sütunu ekle
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'created_by') THEN
    ALTER TABLE cards ADD COLUMN created_by uuid REFERENCES users(id);
  END IF;
END $$;

-- 2. Mevcut kartlar için created_by'ı güncelle (Backfill)
-- Kartın ait olduğu listenin ait olduğu board'un sahibini 'created_by' olarak ata
UPDATE cards 
SET created_by = subquery.user_id
FROM (
  SELECT c.id, b.user_id
  FROM cards c
  JOIN lists l ON c.list_id = l.id
  JOIN boards b ON l.board_id = b.id
) AS subquery
WHERE cards.id = subquery.id AND cards.created_by IS NULL;

-- 3. RLS Etkinleştir
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS "Cards are viewable by everyone" ON cards;
DROP POLICY IF EXISTS "Cards visibility restricted" ON cards;

-- 4. Yeni Kanban Policy
CREATE POLICY "Cards visibility restricted" ON cards
  FOR SELECT
  USING (
    -- Oluşturan kişi
    auth.uid() = created_by OR
    -- Atanan kişi (assigned_to string olduğu için cast gerekebilir, ancak UUID formatındaysa otomatik cast olur. 
    -- Güvenlik için assigned_to'nun auth.uid() string'ine eşit olup olmadığına bakıyoruz)
    assigned_to = auth.uid()::text OR
    -- Board sahibi (Board'a erişimi olanlar da görebilmeli, şimdilik basit tutuyoruz)
    EXISTS (
      SELECT 1 FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = cards.list_id AND b.user_id = auth.uid()
    ) OR
    -- Kullanıcı yetkili bir roldeyse
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND 
      ('admin' = ANY(role) OR 'merkez_kalite' = ANY(role) OR 'sube_kalite' = ANY(role))
    )
  );
