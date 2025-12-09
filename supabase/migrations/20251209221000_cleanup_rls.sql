/*
  # Emergency RLS Cleanup
  
  Eski ve güvensiz politikaları temizler.
*/

-- DOCUMENTS
DROP POLICY IF EXISTS "Anyone can delete documents" ON documents;
DROP POLICY IF EXISTS "Anyone can insert documents" ON documents;
DROP POLICY IF EXISTS "Anyone can update documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can view active documents" ON documents;

-- FEEDBACK
DROP POLICY IF EXISTS "Users can view feedback from their facility" ON feedback_suggestions;
DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedback_suggestions; -- If exists
DROP POLICY IF EXISTS "Authenticated users can create feedback" ON feedback_suggestions; -- Re-evaluate later if needed, strict for now

-- CARDS
DROP POLICY IF EXISTS "Cards visibility restricted" ON cards;

-- Ensure RLS Enabled
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
