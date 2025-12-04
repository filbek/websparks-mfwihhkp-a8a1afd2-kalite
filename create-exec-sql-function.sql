-- Bu SQL kodunu Supabase SQL Editor'de çalıştırın
-- exec_sql fonksiyonunu oluşturur

-- Function to execute arbitrary SQL (for admin operations)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function allows executing SQL dynamically
    -- It should be used carefully and only for admin operations
    BEGIN
        EXECUTE sql;
        RETURN SELECT true, 'SQL executed successfully'::text;
    EXCEPTION WHEN others THEN
        RETURN SELECT false, SQLERRM::text;
    END;
END;
$$;

-- Grant usage to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;