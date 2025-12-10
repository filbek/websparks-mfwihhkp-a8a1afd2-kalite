-- Migration: Make admin@intrasoft.io a System Admin
-- Description: Updates the user's password and role.

-- Enable pgcrypto if it doesn't exist (needed for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- 1. Find the user by email in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@intrasoft.io';

    IF v_user_id IS NOT NULL THEN
        -- 2. Update the password in auth.users
        -- We use crypt with bf (bcrypt) salt, which is standard for Supabase/GoTrue
        UPDATE auth.users 
        SET encrypted_password = crypt('232123Sbb..', gen_salt('bf')),
            updated_at = now()
        WHERE id = v_user_id;

        -- 3. Update the role in public.users
        UPDATE public.users 
        SET role = ARRAY['system_admin'],
            updated_at = now()
        WHERE id = v_user_id;

        RAISE NOTICE 'User admin@intrasoft.io updated successfully to system_admin.';
    ELSE
        RAISE NOTICE 'User admin@intrasoft.io NOT FOUND. Please create the user first via Sign Up.';
    END IF;
END $$;
