-- Fix User Visibility Policy for System Admin

-- 1. Drop the restrictive policy
drop policy if exists "Tenant User Visibility" on public.users;

-- 2. Create the new permissive policy (System Admin gets global access)
create policy "Tenant User Visibility" on public.users
  for select to authenticated
  using (
    (organization_id = get_current_org_id()) 
    OR 
    (id = auth.uid()) 
    OR 
    (
      EXISTS (
        SELECT 1 FROM public.users u_auth 
        WHERE u_auth.id = auth.uid() 
        AND 'system_admin' = ANY(u_auth.role)
      )
    )
  );
