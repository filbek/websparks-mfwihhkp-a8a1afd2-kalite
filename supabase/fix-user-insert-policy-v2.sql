-- Temporary fix: Make the insert_users policy less restrictive
-- This allows the insert to happen even if get_my_role() returns null
-- (which happens when the newly created user tries to insert their own profile)

DROP POLICY IF EXISTS "insert_users" ON users;

CREATE POLICY "insert_users" ON users
  FOR INSERT
  WITH CHECK (
    -- Allow if current user has admin/merkez_kalite/sube_kalite role
    (get_my_role() && ARRAY['admin'::text, 'merkez_kalite'::text, 'sube_kalite'::text])
    OR
    -- OR allow if inserting own profile (id matches auth.uid())
    -- This handles the case where signUp auto-confirms and switches session
    (id = auth.uid())
  );

-- Note: This is less secure but necessary because supabase.auth.signUp()
-- may auto-confirm users and switch the session context
