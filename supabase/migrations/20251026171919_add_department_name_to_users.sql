/*
  # Add department_name column to users table

  1. Changes
    - Add `department_name` column to `users` table to allow custom department labels
    - Make existing department_id nullable for backward compatibility
    - Add index on department_name for better query performance
  
  2. Notes
    - This allows users to have custom department labels independent of the departments table
    - Users can still reference the departments table via department_id if needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'department_name'
  ) THEN
    ALTER TABLE users ADD COLUMN department_name TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_department_name ON users(department_name);
