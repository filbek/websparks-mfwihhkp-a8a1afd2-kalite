-- Disable RLS and use application-level security
-- This is simpler and avoids recursion issues

-- ============================================
-- DISABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own boards" ON boards;
DROP POLICY IF EXISTS "Users can view boards they own or have assigned tasks" ON boards;
DROP POLICY IF EXISTS "Users can create their own boards" ON boards;
DROP POLICY IF EXISTS "Users can update their own boards" ON boards;
DROP POLICY IF EXISTS "Users can delete their own boards" ON boards;

DROP POLICY IF EXISTS "Users can view lists" ON lists;
DROP POLICY IF EXISTS "Users can view lists they own or have assigned tasks" ON lists;
DROP POLICY IF EXISTS "Users can view lists of their boards" ON lists;
DROP POLICY IF EXISTS "Users can create lists in their boards" ON lists;
DROP POLICY IF EXISTS "Users can update lists in their boards" ON lists;
DROP POLICY IF EXISTS "Users can delete lists in their boards" ON lists;

DROP POLICY IF EXISTS "Users can view cards" ON cards;
DROP POLICY IF EXISTS "Users can view cards they own or assigned to them" ON cards;
DROP POLICY IF EXISTS "Users can view cards in their lists" ON cards;
DROP POLICY IF EXISTS "Users can create cards in their lists" ON cards;
DROP POLICY IF EXISTS "Users can update cards" ON cards;
DROP POLICY IF EXISTS "Users can update cards in their lists or assigned to them" ON cards;
DROP POLICY IF EXISTS "Users can delete cards in their lists" ON cards;

-- Note: Security will be handled at the application level
-- The API functions will filter data based on user_id and assigned_to
