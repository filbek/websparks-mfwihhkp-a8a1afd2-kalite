-- Create Storage Bucket for Social Uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('social-uploads', 'social-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Allow public access to view images
DROP POLICY IF EXISTS "Social Uploads Public Access" ON storage.objects;
CREATE POLICY "Social Uploads Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'social-uploads');

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Social Uploads Authenticated Upload" ON storage.objects;
CREATE POLICY "Social Uploads Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'social-uploads');

-- Allow users to update their own uploads
DROP POLICY IF EXISTS "Social Uploads Owner Update" ON storage.objects;
CREATE POLICY "Social Uploads Owner Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'social-uploads' AND auth.uid() = owner);

-- Allow users to delete their own uploads
DROP POLICY IF EXISTS "Social Uploads Owner Delete" ON storage.objects;
CREATE POLICY "Social Uploads Owner Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'social-uploads' AND auth.uid() = owner);
