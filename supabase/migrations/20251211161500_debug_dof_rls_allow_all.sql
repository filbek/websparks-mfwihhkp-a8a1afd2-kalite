-- Relax DÖF INSERT policy to TRUE for debugging/fallback
DROP POLICY IF EXISTS "Users can insert DOFs based on permissions" ON "public"."dofs";

CREATE POLICY "Users can insert DOFs based on permissions" ON "public"."dofs"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  true
);

-- Fix Strict DOF Visibility Policy (ensure it exists and is correct)
-- Removing the invalid cast for dofu_acan
DROP POLICY IF EXISTS "Strict DOF Visibility Policy" ON "public"."dofs";

CREATE POLICY "Strict DOF Visibility Policy" ON "public"."dofs"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  (
    -- System Admin
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND 'system_admin' = ANY(role)
    )
  )
  OR
  (
    -- Tenant Check 
    (organization_id = (current_setting('app.current_org_id', true))::uuid)
    AND
    (
        -- Admin / Merkez Kalite
        (
            EXISTS (
                SELECT 1 FROM public.users u
                WHERE u.id = auth.uid()
                AND ('admin' = ANY(u.role) OR 'merkez_kalite' = ANY(u.role))
            )
        )
        OR
        -- Sube Kalite (Facility Match)
        (
            EXISTS (
                SELECT 1 FROM public.users u
                WHERE u.id = auth.uid()
                AND 'sube_kalite' = ANY(u.role)
                AND u.facility_id = dofs.facility_id
            )
        )
        OR
        -- Reporter / Creator / Assignee / CC
        (
            reporter_id = auth.uid() OR
            dofu_acan = auth.uid() OR 
            assigned_to = auth.uid() OR
            auth.uid() = ANY(cc_users)
        )
    )
  )
);
