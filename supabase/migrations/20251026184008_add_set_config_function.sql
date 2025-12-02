/*
  # Add set_config RPC function for RLS policies

  1. Function
    - Creates `set_config` function to set session variables
    - Used for RLS policies to access current user context (role, facility_id)

  2. Security
    - Function is accessible to authenticated users
    - Sets session-level variables for RLS policy evaluation
*/

-- Create function to set session config variables for RLS
CREATE OR REPLACE FUNCTION set_config(
  config_key text,
  config_value text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config(config_key, config_value, false);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_config(text, text) TO authenticated;
