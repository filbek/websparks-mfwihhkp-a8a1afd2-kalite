/*
  # Complete Multi-Tenant Isolation Migration
  
  ## Kapsam
  - İş Takibi (Kanban): `cards`, `lists`
  - Doküman Yönetimi: `documents` (`document_folders` zaten ok, RLS kontrol edilecek)
  - Bildirimler: `notifications`
  - Görüş-Öneri: `feedback_suggestions` (zaten sütun var, RLS güncellenecek)
  
  ## Adımlar
  1. Tablolara `organization_id` sütunu ekle.
  2. Eski verileri varsayılan organizasyona (Anadolu) ata.
  3. Strict RLS politikalarını uygula.
*/

-- 1. Helper Function (Eğer yoksa - önceki adımda eklendi ama garanti olsun)
CREATE OR REPLACE FUNCTION public.get_current_org_id() 
RETURNS uuid 
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid()
$$;

-- 2. Sütun Ekleme ve Backfill

-- DOCUMENTS
ALTER TABLE documents ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
UPDATE documents SET organization_id = (SELECT id FROM organizations WHERE slug = 'anadolu') WHERE organization_id IS NULL;
ALTER TABLE documents ALTER COLUMN organization_id SET NOT NULL;

-- NOTIFICATIONS
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
UPDATE notifications SET organization_id = (SELECT id FROM organizations WHERE slug = 'anadolu') WHERE organization_id IS NULL;
ALTER TABLE notifications ALTER COLUMN organization_id SET NOT NULL;

-- LISTS (Kanban Kolonları - Eğer varsa)
-- (SQL kontrolüne göre eklenecek, şimdilik varsayıyoruz)
ALTER TABLE lists ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
UPDATE lists SET organization_id = (SELECT id FROM organizations WHERE slug = 'anadolu') WHERE organization_id IS NULL;

-- CARDS (Kanban Kartları)
ALTER TABLE cards ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
UPDATE cards SET organization_id = (SELECT id FROM organizations WHERE slug = 'anadolu') WHERE organization_id IS NULL;
ALTER TABLE cards ALTER COLUMN organization_id SET NOT NULL;


-- 3. RLS Politikaları

-- DOCUMENTS
DROP POLICY IF EXISTS "Tenant Isolation" ON documents;
CREATE POLICY "Tenant Isolation" ON documents
FOR ALL TO authenticated
USING (organization_id = public.get_current_org_id());

-- DOCUMENT FOLDERS
DROP POLICY IF EXISTS "Tenant Isolation" ON document_folders;
CREATE POLICY "Tenant Isolation" ON document_folders
FOR ALL TO authenticated
USING (organization_id = public.get_current_org_id());

-- FEEDBACK SUGGESTIONS
DROP POLICY IF EXISTS "Tenant Isolation" ON feedback_suggestions;
CREATE POLICY "Tenant Isolation" ON feedback_suggestions
FOR ALL TO authenticated
USING (organization_id = public.get_current_org_id());

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Tenant Isolation" ON notifications;
CREATE POLICY "Tenant Isolation" ON notifications
FOR ALL TO authenticated
USING (organization_id = public.get_current_org_id());

-- LISTS
DROP POLICY IF EXISTS "Tenant Isolation" ON lists;
CREATE POLICY "Tenant Isolation" ON lists
FOR ALL TO authenticated
USING (organization_id = public.get_current_org_id());

-- CARDS
DROP POLICY IF EXISTS "Tenant Isolation" ON cards;
CREATE POLICY "Tenant Isolation" ON cards
FOR ALL TO authenticated
USING (organization_id = public.get_current_org_id());

-- CARD SUB-TABLES (Comments, Checklists, Attachments) - Kart üzerinden kontrol
DROP POLICY IF EXISTS "Tenant Isolation via Card" ON card_comments;
CREATE POLICY "Tenant Isolation via Card" ON card_comments
FOR ALL TO authenticated
USING (card_id IN (SELECT id FROM cards WHERE organization_id = public.get_current_org_id()));

DROP POLICY IF EXISTS "Tenant Isolation via Card" ON card_attachments;
CREATE POLICY "Tenant Isolation via Card" ON card_attachments
FOR ALL TO authenticated
USING (card_id IN (SELECT id FROM cards WHERE organization_id = public.get_current_org_id()));

DROP POLICY IF EXISTS "Tenant Isolation via Card" ON card_checklists;
CREATE POLICY "Tenant Isolation via Card" ON card_checklists
FOR ALL TO authenticated
USING (card_id IN (SELECT id FROM cards WHERE organization_id = public.get_current_org_id()));
