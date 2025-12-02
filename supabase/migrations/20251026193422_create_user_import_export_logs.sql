/*
  # Create user import/export audit logs

  1. New Tables
    - `user_import_export_logs`
      - `id` (uuid, primary key)
      - `operation_type` (text) - 'import' or 'export'
      - `performed_by` (uuid) - references users table
      - `facility_id` (integer) - which facility the operation was for
      - `total_users` (integer) - total number of users in operation
      - `successful_users` (integer) - successfully processed users
      - `failed_users` (integer) - failed users
      - `error_details` (jsonb) - detailed error information
      - `file_name` (text) - name of the file
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_import_export_logs` table
    - Add policies for admin and merkez_kalite roles to view logs
    - Add policy for authenticated users to insert logs

  3. Indexes
    - Add index on operation_type for filtering
    - Add index on performed_by for user activity tracking
    - Add index on created_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS user_import_export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL CHECK (operation_type IN ('import', 'export')),
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  facility_id INTEGER,
  total_users INTEGER DEFAULT 0,
  successful_users INTEGER DEFAULT 0,
  failed_users INTEGER DEFAULT 0,
  error_details JSONB,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_import_export_logs_operation_type
  ON user_import_export_logs(operation_type);

CREATE INDEX IF NOT EXISTS idx_user_import_export_logs_performed_by
  ON user_import_export_logs(performed_by);

CREATE INDEX IF NOT EXISTS idx_user_import_export_logs_created_at
  ON user_import_export_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_import_export_logs_facility_id
  ON user_import_export_logs(facility_id);

ALTER TABLE user_import_export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and central quality can view import/export logs"
  ON user_import_export_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role && ARRAY['admin', 'merkez_kalite']::text[])
    )
  );

CREATE POLICY "Authenticated users can insert import/export logs"
  ON user_import_export_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = performed_by
  );