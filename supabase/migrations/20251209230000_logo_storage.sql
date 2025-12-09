-- 1. Create Storage Bucket for Logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies
-- Allow public access to view logos
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'logos');

-- Allow authenticated users to upload logos (we'll restrict UI to admins)
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');

-- Allow users to update their own uploads (optional, but good for retries)
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos');

-- 3. Database Permissions
-- Allow admins to UPDATE their own organization
CREATE POLICY "Admins can update their own organization" ON organizations
FOR UPDATE TO authenticated
USING (
  id = (SELECT organization_id FROM users WHERE id = auth.uid())
  AND 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND 'admin' = ANY(role))
)
WITH CHECK (
  id = (SELECT organization_id FROM users WHERE id = auth.uid())
);
