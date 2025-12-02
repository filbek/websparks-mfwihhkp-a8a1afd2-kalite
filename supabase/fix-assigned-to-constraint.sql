-- Fix foreign key constraint for assigned_to field
-- Drop the old constraint
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_assigned_to_fkey;

-- Add new constraint referencing public.users instead of auth.users
ALTER TABLE cards 
ADD CONSTRAINT cards_assigned_to_fkey 
FOREIGN KEY (assigned_to) 
REFERENCES public.users(id) 
ON DELETE SET NULL;
