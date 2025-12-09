/*
  # Multi-Tenant Data Isolation MIGRATION (Fixed V3)
*/

-- 1. DOFS Tablosu Hazırlığı
ALTER TABLE dofs ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

-- Mevcut DOFs kayıtlarını Anadolu Hastaneleri'ne (varsayılan) ata
UPDATE dofs 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'anadolu')
WHERE organization_id IS NULL;

-- 2. Helper Function
CREATE OR REPLACE FUNCTION public.get_current_org_id() 
RETURNS uuid 
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid()
$$;

-- 3. RLS Politikaları --

-- DÖF İzolasyonu
DROP POLICY IF EXISTS "Strict DOF Visibility Policy" ON dofs;
CREATE POLICY "Strict DOF Visibility Policy" ON dofs
FOR SELECT TO authenticated
USING (
  organization_id = public.get_current_org_id()
  AND (
    (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND ('admin' = ANY(users.role) OR 'merkez_kalite' = ANY(users.role))))
    OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND 'sube_kalite' = ANY(users.role) AND users.facility_id = dofs.facility_id))
    OR
    (reporter_id = auth.uid() OR dofu_acan = auth.uid() OR assigned_to = auth.uid() OR auth.uid() = ANY(cc_users))
  )
);

-- Olay Bildirim İzolasyonu (Düzeltildi: assigned_to kullanıldı)
DROP POLICY IF EXISTS "Events visibility" ON events;
CREATE POLICY "Events visibility" ON events
FOR SELECT TO authenticated
USING (
  organization_id = public.get_current_org_id()
  AND (
    (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND ('admin' = ANY(role) OR 'merkez_kalite' = ANY(role))))
    OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND 'sube_kalite' = ANY(role) AND users.facility_id = events.facility_id))
    OR
    -- Hata kaynağı düzeltildi: event_assignments yerine assigned_to
    (reporter_id = auth.uid() OR assigned_to = auth.uid()) 
  )
);

-- Kullanıcı İzolasyonu
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Public profiles are visible to everyone" ON users;
CREATE POLICY "Tenant User Visibility" ON users
FOR SELECT TO authenticated
USING (
  organization_id = public.get_current_org_id()
  OR id = auth.uid()
);

-- Tesis İzolasyonu
DROP POLICY IF EXISTS "Facilities are viewable by everyone" ON facilities;
CREATE POLICY "Tenant Facility Visibility" ON facilities
FOR SELECT TO authenticated
USING (
  organization_id = public.get_current_org_id()
);
