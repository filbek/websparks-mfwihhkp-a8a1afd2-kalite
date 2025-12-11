-- Fix Strict DOF Visibility Policy to be robust (remove app.current_org_id dependency)
DROP POLICY IF EXISTS "Strict DOF Visibility Policy" ON "public"."dofs";

CREATE POLICY "Strict DOF Visibility Policy" ON "public"."dofs"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  -- 1. System Admin (Global Access)
  (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND 'system_admin' = ANY(role)
    )
  )
  OR
  (
    -- 2. Tenant Isolation & Role Checks
    -- Check if DOF belongs to User's Organization (Robust check via users table)
    (
      organization_id = (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
      )
    )
    AND
    (
        -- A. Admin / Merkez Kalite (Can see everything in Org)
        (
            EXISTS (
                SELECT 1 FROM public.users u
                WHERE u.id = auth.uid()
                AND ('admin' = ANY(u.role) OR 'merkez_kalite' = ANY(u.role))
            )
        )
        OR
        -- B. Sube Kalite (Can see everything in their Facility)
        (
            EXISTS (
                SELECT 1 FROM public.users u
                WHERE u.id = auth.uid()
                AND 'sube_kalite' = ANY(u.role)
                AND u.facility_id = dofs.facility_id
            )
        )
        OR
        -- C. Reporter / Creator / Assignee / CC (Can see their own related DOFs)
        (
            reporter_id = auth.uid() OR
            dofu_acan = auth.uid() OR 
            assigned_to = auth.uid() OR
            auth.uid() = ANY(cc_users)
        )
    )
  )
);

-- Revert INSERT Policy to Secure but Simple Version
DROP POLICY IF EXISTS "Users can insert DOFs based on permissions" ON "public"."dofs";

CREATE POLICY "Users can insert DOFs based on permissions" ON "public"."dofs"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if Reporter is Self (Most common/robust case)
  (reporter_id = auth.uid())
  OR
  -- Allow Admins/Quality Managers (Fallback)
  (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND (
          'system_admin' = ANY(u.role) OR
          'admin' = ANY(u.role) OR
          'merkez_kalite' = ANY(u.role) OR
          'sube_kalite' = ANY(u.role)
        )
    )
  )
);
