-- Trello-style features schema
-- Add checklists, attachments, comments, activity log, and completion status

-- ============================================
-- CARD CHECKLISTS
-- ============================================
CREATE TABLE IF NOT EXISTS card_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_card_checklists_card_id ON card_checklists(card_id);

-- ============================================
-- CHECKLIST ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID REFERENCES card_checklists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_checklist_items_checklist_id ON checklist_items(checklist_id);

-- ============================================
-- CARD ATTACHMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS card_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_card_attachments_card_id ON card_attachments(card_id);

-- ============================================
-- CARD COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS card_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_card_comments_card_id ON card_comments(card_id);

-- ============================================
-- CARD ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS card_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  action_type TEXT NOT NULL,
  action_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_card_activity_card_id ON card_activity(card_id);
CREATE INDEX idx_card_activity_created_at ON card_activity(created_at DESC);

-- ============================================
-- UPDATE CARDS TABLE
-- ============================================
ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES public.users(id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for card_comments
DROP TRIGGER IF EXISTS update_card_comments_updated_at ON card_comments;
CREATE TRIGGER update_card_comments_updated_at
    BEFORE UPDATE ON card_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
