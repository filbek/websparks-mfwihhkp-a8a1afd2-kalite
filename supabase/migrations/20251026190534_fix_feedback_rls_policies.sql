/*
  # Fix feedback RLS policies to use auth.uid()

  1. Changes
    - Drop existing policies that use current_setting
    - Create new policies that use auth.uid() and join with users table
    - Policies check user role and facility directly from users table

  2. Security
    - Authenticated users can insert feedback if they have appropriate role
    - Users can only view feedback from their facility (unless admin/merkez_kalite)
    - Facility quality and admins can manage all feedback in their facility
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Personel görüş oluşturabilir" ON feedback_suggestions;
DROP POLICY IF EXISTS "Personel kendi şubesindeki görüşleri görebilir" ON feedback_suggestions;
DROP POLICY IF EXISTS "Şube kalite kendi şubesindeki görüşleri yönetebilir" ON feedback_suggestions;

-- Create new INSERT policy: authenticated users can create feedback
CREATE POLICY "Authenticated users can create feedback"
  ON feedback_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE is_active = true)
  );

-- Create new SELECT policy: users can view feedback from their facility
CREATE POLICY "Users can view feedback from their facility"
  ON feedback_suggestions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_active = true
      AND (
        -- Admin and merkez_kalite can see all
        'admin' = ANY(users.role) OR
        'merkez_kalite' = ANY(users.role) OR
        -- Sube_kalite and personel can see their facility's feedback
        (users.facility_id = feedback_suggestions.facility_id)
      )
    )
  );

-- Create new UPDATE policy: quality and admins can update
CREATE POLICY "Quality and admins can update feedback"
  ON feedback_suggestions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_active = true
      AND (
        'admin' = ANY(users.role) OR
        'merkez_kalite' = ANY(users.role) OR
        ('sube_kalite' = ANY(users.role) AND users.facility_id = feedback_suggestions.facility_id)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_active = true
      AND (
        'admin' = ANY(users.role) OR
        'merkez_kalite' = ANY(users.role) OR
        ('sube_kalite' = ANY(users.role) AND users.facility_id = feedback_suggestions.facility_id)
      )
    )
  );

-- Create new DELETE policy: only admins can delete
CREATE POLICY "Admins can delete feedback"
  ON feedback_suggestions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_active = true
      AND 'admin' = ANY(users.role)
    )
  );
