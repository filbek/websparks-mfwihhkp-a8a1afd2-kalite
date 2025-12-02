/*
  # Recreate set_config RPC function for RLS policies

  1. Function
    - Creates `set_user_context` function to set session variables
    - Used for RLS policies to access current user context (role, facility_id)
    - Avoids naming conflict with PostgreSQL built-in set_config

  2. Security
    - Function is accessible to authenticated users
    - Sets session-level variables for RLS policy evaluation
*/

-- Create function to set session config variables for RLS
CREATE OR REPLACE FUNCTION set_user_context(
  user_id_value text,
  user_role_value text,
  facility_id_value text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id_value, false);
  PERFORM set_config('app.current_user_role', user_role_value, false);
  PERFORM set_config('app.current_user_facility_id', facility_id_value, false);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_user_context(text, text, text) TO authenticated;
