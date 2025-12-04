-- DISABLE RLS TEMPORARILY (ALL TABLES)
-- Bu scripti çalıştırarak RLS'i geçici olarak devre dışı bırakabilirsiniz.

DO $$
BEGIN
  -- Kanban Tables
  ALTER TABLE boards DISABLE ROW LEVEL SECURITY;
  ALTER TABLE lists DISABLE ROW LEVEL SECURITY;
  ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
  ALTER TABLE card_checklists DISABLE ROW LEVEL SECURITY;
  ALTER TABLE checklist_items DISABLE ROW LEVEL SECURITY;
  ALTER TABLE card_attachments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE card_comments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE card_activity DISABLE ROW LEVEL SECURITY;

  -- Feedback Tables
  ALTER TABLE feedback_suggestions DISABLE ROW LEVEL SECURITY;
  ALTER TABLE feedback_categories DISABLE ROW LEVEL SECURITY;
  ALTER TABLE feedback_responses DISABLE ROW LEVEL SECURITY;
  ALTER TABLE feedback_votes DISABLE ROW LEVEL SECURITY;

  RAISE NOTICE 'RLS has been disabled for ALL tables (Kanban + Feedback).';
END $$;
