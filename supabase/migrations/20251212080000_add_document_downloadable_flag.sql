-- Add is_downloadable column to documents table

ALTER TABLE public.documents 
ADD COLUMN is_downloadable boolean DEFAULT true;

-- Update existing records to be downloadable (already covered by default, but explicit for clarity)
UPDATE public.documents SET is_downloadable = true WHERE is_downloadable IS NULL;
