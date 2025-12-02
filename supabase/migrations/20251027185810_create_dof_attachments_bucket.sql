/*
  # Create DOF Attachments Storage Bucket

  1. Storage
    - Create `dof-attachments` bucket for DOF file attachments
    - Make bucket private (not public)
    
  2. Security
    - Enable RLS on the bucket
    - Users can upload files to DOFs they can access
    - Users can view files from DOFs they can access
    - Users can delete files they uploaded
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dof-attachments',
  'dof-attachments',
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload DOF attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dof-attachments'
    AND auth.uid() IS NOT NULL
  );

-- Allow users to view attachments for DOFs they can access
CREATE POLICY "Users can view DOF attachments they have access to"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'dof-attachments'
    AND (
      -- Users can view attachments from DOFs in their facility
      EXISTS (
        SELECT 1 FROM dof_attachments da
        JOIN dofs d ON da.dof_id = d.id
        JOIN users u ON u.id = auth.uid()
        WHERE da.storage_path = storage.objects.name
        AND (
          d.facility_id = u.facility_id
          OR d.assigned_to = auth.uid()
          OR d.reporter_id = auth.uid()
          OR 'admin'::text = ANY(u.role)
          OR 'merkez_kalite'::text = ANY(u.role)
        )
      )
    )
  );

-- Allow users to delete files they uploaded
CREATE POLICY "Users can delete their own DOF attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dof-attachments'
    AND (
      owner = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND ('admin'::text = ANY(users.role) OR 'merkez_kalite'::text = ANY(users.role))
      )
    )
  );
