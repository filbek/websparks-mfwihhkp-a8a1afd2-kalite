-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for boards
CREATE POLICY "Users can view their own boards" ON boards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards" ON boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" ON boards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" ON boards
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for lists (accessible if user owns the board)
CREATE POLICY "Users can view lists of their boards" ON lists
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = lists.board_id AND boards.user_id = auth.uid())
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

-- RLS Policies for cards (accessible if user owns the board of the list)
CREATE POLICY "Users can view cards in their lists" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cards in their lists" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their lists" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards in their lists" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id AND boards.user_id = auth.uid()
    )
  );
