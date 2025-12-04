/*
  # Add folder_id to documents table

  ## Overview
  This migration adds a folder_id column to the documents table to link documents with folders,
  enabling hierarchical organization of documents within folders.

  ## Changes
  
  ### Modified Tables
  
  #### `documents`
  - Add `folder_id` (uuid, nullable) - Reference to document_folders table
  - Documents without folder_id are considered to be in the root level

  ## Indexes
  - Add index on folder_id for efficient folder-based queries

  ## Important Notes
  1. folder_id is nullable to allow documents at root level (not in any folder)
  2. ON DELETE SET NULL ensures documents remain if parent folder is deleted
  3. This allows documents to exist independently of folders
  4. Existing documents will have NULL folder_id (root level)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'folder_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN folder_id uuid REFERENCES document_folders(id) ON DELETE SET NULL;
    CREATE INDEX idx_documents_folder ON documents(folder_id);
  END IF;
END $$;