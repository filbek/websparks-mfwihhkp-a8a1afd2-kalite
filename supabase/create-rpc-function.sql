-- Create a wrapper function for set_config to be accessible via RPC
-- This is required for setting the organization context (app.current_org_id)

CREATE OR REPLACE FUNCTION set_config(setting text, value text)
RETURNS void AS $$
BEGIN
  -- false means the setting is local to the transaction (but for RPC it applies to the session)
  PERFORM set_config(setting, value, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_config(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION set_config(text, text) TO anon;
