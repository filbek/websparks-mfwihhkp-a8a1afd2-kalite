-- SQL Functions for Supabase Database Management
-- These functions should be created in Supabase SQL Editor first

-- Function to execute arbitrary SQL (for admin operations)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only allow this function to be executed by service_role
    IF current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
        RETURN SELECT false, 'Unauthorized'::text;
    END IF;
    
    BEGIN
        EXECUTE sql;
        RETURN SELECT true, 'SQL executed successfully'::text;
    EXCEPTION WHEN others THEN
        RETURN SELECT false, SQLERRM::text;
    END;
END;
$$;

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = table_exists.table_name
    );
END;
$$;

-- Function to check if all feedback tables exist
CREATE OR REPLACE FUNCTION feedback_tables_ready()
RETURNS TABLE(table_name text, exists boolean)
LANGUAGE plpgsql
AS $$
DECLARE
    tables text[] := ARRAY['feedback_categories', 'feedback_suggestions', 'feedback_responses', 'feedback_votes'];
    tbl text;
BEGIN
    CREATE TEMP TABLE IF NOT EXISTS result (table_name text, exists boolean);
    
    FOREACH tbl IN ARRAY tables
    LOOP
        INSERT INTO result
        SELECT tbl, table_exists(tbl);
    END LOOP;
    
    RETURN QUERY SELECT * FROM result;
END;
$$;