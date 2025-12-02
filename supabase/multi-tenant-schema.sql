-- Multi-Tenant Architecture: Organizations and Tenant Isolation
-- Phase 1: Create organizations table and add tenant_id to all tables

-- ============================================
-- ORGANIZATIONS TABLE
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

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- ============================================
-- ADD ORGANIZATION_ID TO EXISTING TABLES
-- ============================================

-- Users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

-- Feedback table
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_feedback_organization_id ON feedback(organization_id);

-- Boards table (Kanban)
ALTER TABLE boards ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_boards_organization_id ON boards(organization_id);

-- Lists table (Kanban)
ALTER TABLE lists ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_lists_organization_id ON lists(organization_id);

-- Cards table (Kanban)
ALTER TABLE cards ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_cards_organization_id ON cards(organization_id);

-- Card checklists
ALTER TABLE card_checklists ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_card_checklists_organization_id ON card_checklists(organization_id);

-- Checklist items
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_checklist_items_organization_id ON checklist_items(organization_id);

-- Card attachments
ALTER TABLE card_attachments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_card_attachments_organization_id ON card_attachments(organization_id);

-- Card comments
ALTER TABLE card_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_card_comments_organization_id ON card_comments(organization_id);

-- Card activity
ALTER TABLE card_activity ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_card_activity_organization_id ON card_activity(organization_id);

-- ============================================
-- MIGRATE EXISTING DATA TO DEFAULT ORGANIZATION
-- ============================================

-- Create default organization for existing data
INSERT INTO organizations (id, name, slug, subscription_plan, subscription_status)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'Default Organization',
  'default',
  'enterprise',
  'active'
)
ON CONFLICT (slug) DO NOTHING;

-- Update existing records with default organization_id
UPDATE users SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE feedback SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE boards SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE lists SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE cards SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE card_checklists SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE checklist_items SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE card_attachments SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE card_comments SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;
UPDATE card_activity SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE organization_id IS NULL;

-- Make organization_id NOT NULL after migration
ALTER TABLE users ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE feedback ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE boards ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE lists ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE cards ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE card_checklists ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE checklist_items ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE card_attachments ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE card_comments ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE card_activity ALTER COLUMN organization_id SET NOT NULL;

-- ============================================
-- RLS POLICIES FOR MULTI-TENANT ISOLATION
-- ============================================

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own organization
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Update RLS policies for feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view feedback in their organization" ON feedback;
CREATE POLICY "Users can view feedback in their organization" ON feedback
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create feedback in their organization" ON feedback
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Update RLS policies for boards
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view boards in their organization" ON boards;
CREATE POLICY "Users can view boards in their organization" ON boards
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create boards in their organization" ON boards
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own boards" ON boards
  FOR UPDATE USING (
    user_id = auth.uid() AND 
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete their own boards" ON boards
  FOR DELETE USING (
    user_id = auth.uid() AND 
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Similar policies for other tables
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_activity ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get current user's organization_id
CREATE OR REPLACE FUNCTION get_current_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND email LIKE '%@yourdomain.com'
  );
$$ LANGUAGE SQL SECURITY DEFINER;
