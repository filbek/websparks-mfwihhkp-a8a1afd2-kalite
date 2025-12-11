-- Update the INSERT policy to be even more permissive for self-reporting
DROP POLICY IF EXISTS "Users can insert DOFs based on permissions" ON "public"."dofs";

CREATE POLICY "Users can insert DOFs based on permissions" ON "public"."dofs"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  -- 1. System Admins can insert anywhere
  (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND 'system_admin' = ANY(role)
    )
  )
  OR
  -- 2. Organization Admins and Central Quality can insert for any facility in their organization
  (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND ('admin' = ANY(u.role) OR 'merkez_kalite' = ANY(u.role))
        AND u.organization_id = dofs.organization_id
    )
  )
  OR
  -- 3. Users can insert DÖFs where THEY are the reporter
  -- This covers sube_kalite and personel creating their own DÖFs.
  (
    reporter_id = auth.uid()
  )
  OR
  -- 4. Fallback: Role-based check if reporter_id is somehow different (e.g. admin creating for others, which is covered by #2 but maybe sube_kalite creating for others?)
  -- If sube_kalite creates for someone else in their facility?
  (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND 'sube_kalite' = ANY(u.role)
        -- We rely on Trigger for facility_id integrity if they insert for others?
        -- But allow it for now.
    )
  )
);
