-- Fix infinite recursion in RLS policies
-- Use simpler policies without nested queries

-- ============================================
-- BOARDS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view boards they own or have assigned tasks" ON boards;
DROP POLICY IF EXISTS "Users can view their own boards" ON boards;
DROP POLICY IF EXISTS "Users can create their own boards" ON boards;
DROP POLICY IF EXISTS "Users can update their own boards" ON boards;
DROP POLICY IF EXISTS "Users can delete their own boards" ON boards;

-- Simple policy: Users can view boards they own
CREATE POLICY "Users can view their own boards" ON boards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards" ON boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" ON boards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" ON boards
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- LISTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view lists they own or have assigned tasks" ON lists;
DROP POLICY IF EXISTS "Users can view lists of their boards" ON lists;
DROP POLICY IF EXISTS "Users can create lists in their boards" ON lists;
DROP POLICY IF EXISTS "Users can update lists in their boards" ON lists;
DROP POLICY IF EXISTS "Users can delete lists in their boards" ON lists;

-- Lists are accessible if user owns the board OR has a card assigned in that list
CREATE POLICY "Users can view lists" ON lists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND boards.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM cards
      WHERE cards.list_id = lists.id
      AND cards.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Users can create lists in their boards" ON lists
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = lists.board_id AND boards.user_id = auth.uid())
  );

CREATE POLICY "Users can update lists in their boards" ON lists
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = lists.board_id AND boards.user_id = auth.uid())
  );

CREATE POLICY "Users can delete lists in their boards" ON lists
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = lists.board_id AND boards.user_id = auth.uid())
  );

-- ============================================
-- CARDS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view cards they own or assigned to them" ON cards;
DROP POLICY IF EXISTS "Users can view cards in their lists" ON cards;
DROP POLICY IF EXISTS "Users can create cards in their lists" ON cards;
DROP POLICY IF EXISTS "Users can update cards in their lists or assigned to them" ON cards;
DROP POLICY IF EXISTS "Users can delete cards in their lists" ON cards;

-- Cards are accessible if user owns the board OR card is assigned to them
CREATE POLICY "Users can view cards" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id AND boards.user_id = auth.uid()
    )
    OR
    cards.assigned_to = auth.uid()
  );

CREATE POLICY "Users can create cards in their lists" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id AND boards.user_id = auth.uid()
    )
    OR
    cards.assigned_to = auth.uid()
  );

CREATE POLICY "Users can delete cards in their lists" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id AND boards.user_id = auth.uid()
    )
  );
