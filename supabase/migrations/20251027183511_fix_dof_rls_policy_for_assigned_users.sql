/*
  # Fix DOF RLS Policy for Assigned Users

  1. Changes
    - Update the SELECT policy on dofs table to allow users to see DOFs that are assigned to them
    - Previous policy only allowed users to see DOFs in their facility
    - New policy allows users to see:
      - DOFs in their facility
      - DOFs assigned to them (regardless of facility)
      - All DOFs if they are admin or merkez_kalite

  2. Security
    - Maintains RLS security
    - Users can only see DOFs they have legitimate access to
*/

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view DOFs in their facility" ON dofs;

-- Create new SELECT policy that includes assigned DOFs
CREATE POLICY "Users can view DOFs in their facility or assigned to them"
  ON dofs
  FOR SELECT
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
