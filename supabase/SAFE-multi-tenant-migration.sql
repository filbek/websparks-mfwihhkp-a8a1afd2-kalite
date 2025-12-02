-- SAFE Multi-Tenant Migration Script
-- This script adds organization support to existing tables
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
-- STEP 3: ADD ORGANIZATION_ID TO TABLES
-- ============================================

-- Users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

-- Feedback table  
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_feedback_organization_id ON feedback(organization_id);

-- Events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_events_organization_id ON events(organization_id);

-- DOF tables
ALTER TABLE dof_kaynaklari ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE dof_kategorileri ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE dof_kisa_aciklamalar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE dof_sorumlu_bolumler ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE dof_attachments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE dof_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE dof_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE dof_locations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Kanban tables
ALTER TABLE boards ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_boards_organization_id ON boards(organization_id);

ALTER TABLE lists ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_lists_organization_id ON lists(organization_id);

ALTER TABLE cards ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_cards_organization_id ON cards(organization_id);

-- Trello features tables (if they exist)
ALTER TABLE card_checklists ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE card_attachments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE card_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE card_activity ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Document tables
ALTER TABLE document_folders ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Event attachments
ALTER TABLE event_attachments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Error categories
ALTER TABLE error_categories ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE error_sub_categories ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Task assignments
ALTER TABLE task_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Department assignments
ALTER TABLE department_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Feedback categories
ALTER TABLE feedback_categories ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- ============================================
-- STEP 4: MIGRATE EXISTING DATA
-- ============================================

-- Update all existing records with default organization
UPDATE users SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE feedback SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE events SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE boards SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE lists SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE cards SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE dof_kaynaklari SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE dof_kategorileri SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE dof_kisa_aciklamalar SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE dof_sorumlu_bolumler SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE dof_attachments SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE dof_history SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE dof_comments SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE dof_locations SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE document_folders SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE event_attachments SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE error_categories SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE error_sub_categories SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE task_assignments SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE department_assignments SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE feedback_categories SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;

-- Trello features (if exist)
UPDATE card_checklists SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE checklist_items SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE card_attachments SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE card_comments SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE card_activity SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;

-- ============================================
-- STEP 5: MAKE ORGANIZATION_ID NOT NULL (OPTIONAL - UNCOMMENT IF NEEDED)
-- ============================================
-- ALTER TABLE users ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE feedback ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE events ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE boards ALTER COLUMN organization_id SET NOT NULL;
-- ... add for other tables as needed

-- ============================================
-- STEP 6: ENABLE RLS ON ORGANIZATIONS
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- ============================================
-- STEP 7: UPDATE RLS POLICIES FOR MULTI-TENANT
-- ============================================

-- Note: Existing RLS policies will continue to work
-- You can gradually update them to include organization_id checks
-- For now, we keep existing policies and add organization context

-- Helper function to get current user's organization
CREATE OR REPLACE FUNCTION get_current_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check organizations
-- SELECT * FROM organizations;

-- Check if all users have organization_id
-- SELECT COUNT(*) as total, COUNT(organization_id) as with_org FROM users;

-- Check if all boards have organization_id
-- SELECT COUNT(*) as total, COUNT(organization_id) as with_org FROM boards;
