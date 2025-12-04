-- Fix the INSERT policy for users table to properly handle organization_id
-- Drop existing insert policy
DROP POLICY IF EXISTS "insert_users" ON users;

-- Create new insert policy that checks both role and organization
CREATE POLICY "insert_users" ON users
  FOR INSERT
  WITH CHECK (
    -- User must have admin, merkez_kalite, or sube_kalite role
    (get_my_role() && ARRAY['admin'::text, 'merkez_kalite'::text, 'sube_kalite'::text])
    AND
    -- New user must belong to the same organization as the creator
    (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
  );
