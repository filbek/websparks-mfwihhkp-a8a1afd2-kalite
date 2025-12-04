-- title ve description kolonlarını nullable yap veya varsayılan değer ekle
DO $$
BEGIN
  -- title kolonunu nullable yap
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'title' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE events ALTER COLUMN title DROP NOT NULL;
  END IF;

  -- description kolonunu nullable yap
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'description' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE events ALTER COLUMN description DROP NOT NULL;
  END IF;

  -- department_id kolonunu nullable yap
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'department_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE events ALTER COLUMN department_id DROP NOT NULL;
  END IF;

  -- severity kolonunu nullable yap
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'severity' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE events ALTER COLUMN severity DROP NOT NULL;
  END IF;

  -- occurred_at kolonunu nullable yap
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'occurred_at' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE events ALTER COLUMN occurred_at DROP NOT NULL;
  END IF;
END $$;