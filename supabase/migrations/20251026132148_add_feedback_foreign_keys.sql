/*
  # Görüş ve Öneriler - Foreign Key İlişkileri

  1. Foreign Key Kısıtlamaları
    - feedback_suggestions.facility_id -> facilities.id
    - feedback_suggestions.category_id -> feedback_categories.id
    - feedback_suggestions.reporter_id -> users.id
    - feedback_responses.feedback_id -> feedback_suggestions.id
    - feedback_responses.responder_id -> users.id
    - feedback_votes.feedback_id -> feedback_suggestions.id
    - feedback_votes.user_id -> users.id

  2. Notlar
    - Foreign key ilişkileri Supabase'in otomatik join özelliğini kullanabilmesi için gereklidir
*/

-- feedback_suggestions tablosu için foreign key'ler
DO $$
BEGIN
  -- facility_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feedback_suggestions_facility_id_fkey'
  ) THEN
    ALTER TABLE feedback_suggestions
      ADD CONSTRAINT feedback_suggestions_facility_id_fkey
      FOREIGN KEY (facility_id) REFERENCES facilities(id)
      ON DELETE CASCADE;
  END IF;

  -- category_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feedback_suggestions_category_id_fkey'
  ) THEN
    ALTER TABLE feedback_suggestions
      ADD CONSTRAINT feedback_suggestions_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES feedback_categories(id)
      ON DELETE SET NULL;
  END IF;

  -- reporter_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feedback_suggestions_reporter_id_fkey'
  ) THEN
    ALTER TABLE feedback_suggestions
      ADD CONSTRAINT feedback_suggestions_reporter_id_fkey
      FOREIGN KEY (reporter_id) REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- feedback_responses tablosu için foreign key'ler
DO $$
BEGIN
  -- feedback_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feedback_responses_feedback_id_fkey'
  ) THEN
    ALTER TABLE feedback_responses
      ADD CONSTRAINT feedback_responses_feedback_id_fkey
      FOREIGN KEY (feedback_id) REFERENCES feedback_suggestions(id)
      ON DELETE CASCADE;
  END IF;

  -- responder_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feedback_responses_responder_id_fkey'
  ) THEN
    ALTER TABLE feedback_responses
      ADD CONSTRAINT feedback_responses_responder_id_fkey
      FOREIGN KEY (responder_id) REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- feedback_votes tablosu için foreign key'ler
DO $$
BEGIN
  -- feedback_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feedback_votes_feedback_id_fkey'
  ) THEN
    ALTER TABLE feedback_votes
      ADD CONSTRAINT feedback_votes_feedback_id_fkey
      FOREIGN KEY (feedback_id) REFERENCES feedback_suggestions(id)
      ON DELETE CASCADE;
  END IF;

  -- user_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feedback_votes_user_id_fkey'
  ) THEN
    ALTER TABLE feedback_votes
      ADD CONSTRAINT feedback_votes_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;
  END IF;
END $$;