/*
  # Create Document Folders Table

  ## Overview
  This migration creates a folders table for organizing documents in a hierarchical structure,
  similar to a file system. Users can create folders, nest them, and organize documents within them.

  ## New Tables
  
  ### `document_folders`
  - `id` (uuid, primary key) - Unique identifier for each folder
  - `name` (text) - Folder name (required)
  - `description` (text, nullable) - Optional description of folder contents
  - `parent_id` (uuid, nullable) - Reference to parent folder for hierarchy
  - `category_id` (uuid, nullable) - Reference to document category
  - `facility_id` (integer) - Reference to facility this folder belongs to
  - `created_by` (uuid) - Reference to user who created the folder
  - `is_active` (boolean) - Soft delete flag, defaults to true
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on `document_folders` table
  - Policy for authenticated users to view folders from their facility
  - Policy for authenticated users to create folders in their facility
  - Policy for authenticated users to update their own folders or if they're admin
  - Policy for authenticated users to delete their own folders or if they're admin

  ## Important Notes
  1. Uses hierarchical structure with parent_id for nested folders
  2. Folders are facility-specific to maintain data isolation
  3. Soft delete using is_active flag to preserve folder history
  4. Foreign key constraints ensure data integrity
  5. Cascading updates maintain referential integrity
  6. Role is stored as array, so we use ANY operator for checking
*/

CREATE TABLE IF NOT EXISTS document_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  parent_id uuid REFERENCES document_folders(id) ON DELETE CASCADE,
  category_id uuid REFERENCES document_categories(id) ON DELETE SET NULL,
  facility_id integer NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_folders_facility ON document_folders(facility_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_parent ON document_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_category ON document_folders(category_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_created_by ON document_folders(created_by);

ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view folders in their facility"
  ON document_folders FOR SELECT
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create folders in their facility"
  ON document_folders FOR INSERT
  TO authenticated
  WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own folders or if admin"
  ON document_folders FOR UPDATE
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND 'admin' = ANY(role)
      )
    )
  )
  WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own folders or if admin"
  ON document_folders FOR DELETE
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND 'admin' = ANY(role)
      )
    )
  );