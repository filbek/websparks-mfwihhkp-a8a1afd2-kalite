-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert DOFs in their facility" ON "public"."dofs";
DROP POLICY IF EXISTS "Strict DOF Visibility Policy" ON "public"."dofs";

-- Create new INSERT policy
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
  -- 3. Branch users and others can only insert for their own facility
  (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND u.facility_id = dofs.facility_id
    )
  )
);

-- Re-create SELECT policy to include system_admin
CREATE POLICY "Strict DOF Visibility Policy" ON "public"."dofs"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  -- 1. System Admins can see everything (or filtered by current org if they want, but usually everything is safer to allow, app filters by org)
  -- Actually, the app relies on get_current_org_id() for context switching.
  -- But system_admin should theoretically be able to see everything if no filtered?
  -- Let's stick to the pattern: Either system_admin, OR (match org AND role logic)
  
  (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND 'system_admin' = ANY(role)
    )
  )
  OR
  (
    (dofs.organization_id = (current_setting('app.current_org_id', true))::uuid)
    AND
    (
      -- Admin / Central Quality see all in org
      (EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND ('admin' = ANY(users.role) OR 'merkez_kalite' = ANY(users.role))
      ))
      OR
      -- Branch Quality sees only their facility
      (EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND 'sube_kalite' = ANY(users.role)
        AND users.facility_id = dofs.facility_id
      ))
      OR
      -- Others see only what they are involved in
      (
        dofs.reporter_id = auth.uid() OR
        dofs.dofu_acan = auth.uid() OR
        dofs.assigned_to = auth.uid() OR
        auth.uid() = ANY(dofs.cc_users)
      )
    )
  )
);
