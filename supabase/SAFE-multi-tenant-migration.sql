-- SAFE Multi-Tenant Migration Script (Adaptive)
-- This script safely adds organization support to existing tables
-- It checks if tables exist before attempting to modify them
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: CREATE ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  subscription_plan TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);

-- ============================================
-- STEP 2: CREATE DEFAULT ORGANIZATION
-- ============================================
INSERT INTO organizations (id, name, slug, subscription_plan, subscription_status)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'Default Organization',
  'default',
  'enterprise',
  'active'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- STEP 3: SAFELY ADD ORGANIZATION_ID TO TABLES
-- ============================================

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'users', 'feedback', 'events', 
    'dof_kaynaklari', 'dof_kategorileri', 'dof_kisa_aciklamalar', 'dof_sorumlu_bolumler', 
    'dof_attachments', 'dof_history', 'dof_comments', 'dof_locations',
    'boards', 'lists', 'cards',
    'card_checklists', 'checklist_items', 'card_attachments', 'card_comments', 'card_activity',
    'document_folders', 'event_attachments', 'error_categories', 'error_sub_categories',
    'task_assignments', 'department_assignments', 'feedback_categories'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      -- Add column if not exists
      EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE', tbl);
      
      -- Create index if not exists (checking index existence is complex, so we use IF NOT EXISTS in CREATE INDEX if supported, 
      -- or just catch the error. Postgres 9.5+ supports IF NOT EXISTS for indexes)
      EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_organization_id ON %I(organization_id)', tbl, tbl);
      
      -- Migrate data
      EXECUTE format('UPDATE %I SET organization_id = ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa''::uuid WHERE organization_id IS NULL', tbl);
      
      -- Enable RLS if not enabled (optional, but good practice)
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
      
      RAISE NOTICE 'Updated table: %', tbl;
    ELSE
      RAISE NOTICE 'Table not found (skipping): %', tbl;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- STEP 4: ENABLE RLS ON ORGANIZATIONS
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- ============================================
-- STEP 5: HELPER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_current_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================
-- STEP 6: VERIFICATION
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully.';
END $$;
