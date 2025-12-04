/*
  # Fix DOF UPDATE RLS Policy

  1. Changes
    - Update the UPDATE policy on dofs table to allow users to update DOFs assigned to them
    - Previous policy only allowed users to update DOFs in their facility
    - New policy allows users to update:
      - DOFs in their facility
      - DOFs assigned to them (regardless of facility)
      - DOFs they reported
      - All DOFs if they are admin or merkez_kalite

  2. Security
    - Maintains RLS security
    - Users can only update DOFs they have legitimate access to
*/

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update DOFs they can access" ON dofs;

-- Create new UPDATE policy that includes assigned DOFs
CREATE POLICY "Users can update DOFs in their facility or assigned to them"
  ON dofs
  FOR UPDATE
  TO authenticated
  USING (
    facility_id IN (
      SELECT users.facility_id
      FROM users
      WHERE users.id = auth.uid()
    )
    OR assigned_to = auth.uid()
    OR reporter_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = auth.uid()
      AND ('admin'::text = ANY (users.role))
    )
    OR EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = auth.uid()
      AND ('merkez_kalite'::text = ANY (users.role))
    )
  );
