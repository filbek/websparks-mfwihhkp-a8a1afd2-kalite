-- FIX DATA VISIBILITY SCRIPT (SAFE VERSION)
-- Bu script, tüm kullanıcıları ve verileri "Default Organization"a bağlar.
-- Sadece mevcut tabloları günceller, olmayan tabloları atlar.

DO $$
DECLARE
  default_org_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid;
  tbl text;
  tables text[] := ARRAY[
    'users', 'boards', 'lists', 'cards', 
    'card_checklists', 'checklist_items', 'card_attachments', 
    'card_comments', 'card_activity',
    'events', 'dof_kaynaklari', 'dof_kategorileri', 'dof_kisa_aciklamalar',
    'dof_sorumlu_bolumler', 'dof_attachments', 'dof_history', 'dof_comments',
    'dof_locations', 'document_folders', 'event_attachments',
    'error_categories', 'error_sub_categories', 'task_assignments',
    'department_assignments', 'feedback_categories'
  ];
BEGIN
  -- 1. Organizasyonun var olduğundan emin ol
  INSERT INTO organizations (id, name, slug, subscription_plan, subscription_status)
  VALUES (
    default_org_id,
    'Default Organization',
    'default',
    'enterprise',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Her tabloyu kontrol et ve varsa güncelle
  FOREACH tbl IN ARRAY tables
  LOOP
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      -- Tablonun organization_id sütunu var mı kontrol et
      IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = tbl 
        AND column_name = 'organization_id'
      ) THEN
        EXECUTE format('UPDATE %I SET organization_id = $1 WHERE organization_id IS NULL OR organization_id != $1', tbl) 
        USING default_org_id;
        RAISE NOTICE 'Updated table: %', tbl;
      ELSE
        RAISE NOTICE 'Table % does not have organization_id column (skipping)', tbl;
      END IF;
    ELSE
      RAISE NOTICE 'Table % does not exist (skipping)', tbl;
    END IF;
  END LOOP;

  RAISE NOTICE 'Data visibility fix completed!';
END $$;
