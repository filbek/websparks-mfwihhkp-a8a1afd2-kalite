/*
  # Update DOF RLS Policies for Quality Unit Edit Access

  ## Changes
  - Updates the UPDATE policy on dofs table to allow quality unit users to edit DOFs in any status (except closed/cancelled)
  - Allows sube_kalite users to edit all DOFs in their facility regardless of status
  - Allows merkez_kalite and admin users to edit all DOFs regardless of status
  - Maintains existing security for regular users (personel)

  ## Business Logic
  - Closed (kapatıldı) and cancelled (iptal) DOFs cannot be edited by anyone
  - Quality unit users can edit opened DOFs to make corrections or updates
  - Regular users can only edit DOFs in draft (taslak) or rejected (reddedildi) status
  - All edits are tracked in dof_history table

  ## Security
  - Maintains RLS security
  - Users can only edit DOFs they have legitimate access to
  - Status-based restrictions prevent editing of finalized DOFs
*/

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update DOFs in their facility or assigned to them" ON dofs;

-- Create new UPDATE policy with quality unit edit permissions
CREATE POLICY "Users can update DOFs based on role and status"
  ON dofs
  FOR UPDATE
  TO authenticated
  USING (
    -- Prevent editing of closed or cancelled DOFs
    status NOT IN ('kapatıldı', 'iptal')
    AND (
      -- Admin can edit all DOFs
      EXISTS (
        SELECT 1
        FROM users
        WHERE users.id = auth.uid()
        AND ('admin'::text = ANY (users.role))
      )
      -- Merkez Kalite can edit all DOFs
      OR EXISTS (
        SELECT 1
        FROM users
        WHERE users.id = auth.uid()
        AND ('merkez_kalite'::text = ANY (users.role))
      )
      -- Sube Kalite can edit DOFs in their facility
      OR EXISTS (
        SELECT 1
        FROM users
        WHERE users.id = auth.uid()
        AND ('sube_kalite'::text = ANY (users.role))
        AND users.facility_id = dofs.facility_id
      )
      -- Regular users can only edit their own DOFs in draft or rejected status
      OR (
        status IN ('taslak', 'reddedildi')
        AND (
          reporter_id = auth.uid()
          OR assigned_to = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    -- Same conditions for WITH CHECK
    status NOT IN ('kapatıldı', 'iptal')
    AND (
      EXISTS (
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
      OR EXISTS (
        SELECT 1
        FROM users
        WHERE users.id = auth.uid()
        AND ('sube_kalite'::text = ANY (users.role))
        AND users.facility_id = dofs.facility_id
      )
      OR (
        status IN ('taslak', 'reddedildi')
        AND (
          reporter_id = auth.uid()
          OR assigned_to = auth.uid()
        )
      )
    )
  );
