-- Ensure authenticated users can delete from documents bucket
-- Check if policy exists and drop if needed to clean up valid ones
BEGIN;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can delete documents'
    ) THEN
        DROP POLICY "Authenticated users can delete documents" ON storage.objects;
    END IF;
END $$;

CREATE POLICY "Authenticated users can delete documents" ON storage.objects
FOR DELETE TO authenticated
USING ( bucket_id = 'documents' ); 
-- Note: 'USING' for DELETE acts as the check for existing rows.

COMMIT;
