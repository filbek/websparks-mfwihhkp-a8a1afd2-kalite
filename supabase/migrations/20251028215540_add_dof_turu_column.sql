/*
  # Add dof_turu column to dofs table

  1. Changes
    - Add `dof_turu` column to `dofs` table
      - Type: text (values: 'duzeltici' or 'onleyici')
      - Nullable: allows NULL for existing records
      - Default: NULL
  
  2. Notes
    - This column stores whether the DOF is corrective (düzeltici) or preventive (önleyici)
    - Existing records will have NULL value until updated
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dofs' AND column_name = 'dof_turu'
  ) THEN
    ALTER TABLE dofs ADD COLUMN dof_turu text;
  END IF;
END $$;