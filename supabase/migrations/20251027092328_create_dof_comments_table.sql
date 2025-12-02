/*
  # Create DOF Comments Table

  1. New Table
    - `dof_comments` - Comments and notes on DOFs
      - `id` (uuid, primary key)
      - `dof_id` (uuid, foreign key to dofs)
      - `user_id` (uuid, foreign key to users)
      - `comment` (text)
      - `is_internal` (boolean, for internal notes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Authenticated users can view comments for DOFs they have access to
    - Users can create, update, and delete their own comments

  3. Indexes
    - Foreign key indexes for performance
    - Created_at index for sorting
*/

-- Create dof_comments table
CREATE TABLE IF NOT EXISTS dof_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dof_id UUID NOT NULL,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_dof FOREIGN KEY (dof_id) REFERENCES dofs(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dof_comments_dof_id ON dof_comments(dof_id);
CREATE INDEX IF NOT EXISTS idx_dof_comments_user_id ON dof_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_dof_comments_created_at ON dof_comments(created_at DESC);

-- Enable RLS
ALTER TABLE dof_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read comments for accessible DOFs"
  ON dof_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dofs
      WHERE dofs.id = dof_comments.dof_id
      AND (
        dofs.reporter_id = auth.uid()
        OR dofs.assigned_to = auth.uid()
        OR dofs.dofu_acan = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND 'merkez_kalite' = ANY(users.role)
        )
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND 'sube_kalite' = ANY(users.role)
          AND dofs.facility_id = users.facility_id
        )
      )
    )
  );

CREATE POLICY "Users can create comments for accessible DOFs"
  ON dof_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM dofs
      WHERE dofs.id = dof_comments.dof_id
      AND (
        dofs.reporter_id = auth.uid()
        OR dofs.assigned_to = auth.uid()
        OR dofs.dofu_acan = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND ('merkez_kalite' = ANY(users.role) OR 'sube_kalite' = ANY(users.role))
        )
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON dof_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON dof_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger to update updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_dof_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_dof_comments_updated_at
      BEFORE UPDATE ON dof_comments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;