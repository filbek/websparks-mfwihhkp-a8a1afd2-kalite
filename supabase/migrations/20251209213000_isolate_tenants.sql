/*
  # Multi-Tenant Data Isolation Migration
  
  ## Amaç
  Veritabanındaki tüm kritik tablolar için "Organizasyon İzolasyonu" sağlamak.
  Kullanıcılar (Admin dahil) sadece kendi organizasyonlarına ait verileri görebilmelidir.
  
  ## Kapsam
  - DÖF (dofs)
  - Olay Bildirimleri (events)
  - Kullanıcılar (users)
  - Tesisler (facilities)
*/

-- 1. Helper Function: Mevcut kullanıcının organizasyon ID'sini al
CREATE OR REPLACE FUNCTION auth.org_id() 
RETURNS uuid 
LANGUAGE sql STABLE
AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid()
$$;

-- 2. DÖF İzolasyonu
DROP POLICY IF EXISTS "Strict DOF Visibility Policy" ON dofs;
CREATE POLICY "Strict DOF Visibility Policy" ON dofs
FOR SELECT TO authenticated
USING (
  organization_id = auth.org_id() -- Temel İzolasyon
  AND (
    -- Admin/Merkez Kalite: Organizasyondaki HER ŞEYİ görür
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND ('admin' = ANY(users.role) OR 'merkez_kalite' = ANY(users.role))
    ))
    OR
    -- Şube Kalite: Kendi şubesini görür
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND 'sube_kalite' = ANY(users.role) 
      AND users.facility_id = dofs.facility_id
    ))
    OR
    -- Personel: İlişkili olduğu kayıtları görür
    (reporter_id = auth.uid() OR dofu_acan = auth.uid() OR assigned_to = auth.uid() OR auth.uid() = ANY(cc_users))
  )
);

-- 3. Olay Bildirim İzolasyonu
DROP POLICY IF EXISTS "Events visibility" ON events;
CREATE POLICY "Events visibility" ON events
FOR SELECT TO authenticated
USING (
  organization_id = auth.org_id()
  AND (
    (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND ('admin' = ANY(role) OR 'merkez_kalite' = ANY(role))))
    OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND 'sube_kalite' = ANY(role) AND users.facility_id = events.facility_id))
    OR
    (reporter_id = auth.uid() OR id IN (SELECT event_id FROM event_assignments WHERE user_id = auth.uid()))
  )
);

-- 4. Kullanıcı İzolasyonu (Adminler diğer org kullanıcılarını görmemeli)
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Public profiles are visible to everyone" ON users;
CREATE POLICY "Tenant User Visibility" ON users
FOR SELECT TO authenticated
USING (
  organization_id = auth.org_id()
);

-- 5. Tesis İzolasyonu
DROP POLICY IF EXISTS "Facilities are viewable by everyone" ON facilities;
CREATE POLICY "Tenant Facility Visibility" ON facilities
FOR SELECT TO authenticated
USING (
  organization_id = auth.org_id()
);
