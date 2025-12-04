-- Function to create a new user (admin only)
-- This bypasses RLS by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_user_admin(
  p_email TEXT,
  p_password TEXT,
  p_display_name TEXT,
  p_role TEXT[],
  p_facility_id INTEGER,
  p_department_id INTEGER DEFAULT NULL,
  p_department_name TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_organization_id UUID;
  v_current_user_role TEXT[];
  v_result JSON;
BEGIN
  -- Check if current user has permission to create users
  SELECT role INTO v_current_user_role FROM users WHERE id = auth.uid();
  
  IF NOT (v_current_user_role && ARRAY['admin'::text, 'merkez_kalite'::text, 'sube_kalite'::text]) THEN
    RAISE EXCEPTION 'Kullanıcı oluşturma yetkiniz yok';
  END IF;

  -- Get current user's organization_id
  SELECT organization_id INTO v_organization_id FROM users WHERE id = auth.uid();
  
  IF v_organization_id IS NULL THEN
    RAISE EXCEPTION 'Organizasyon bilgisi bulunamadı';
  END IF;

  -- Create auth user (this will be done via client-side supabase.auth.signUp)
  -- We can't create auth users from SQL, so we'll just insert into users table
  -- The auth user creation must happen client-side first
  
  -- For now, return a placeholder response
  -- The actual implementation will be handled differently
  RAISE EXCEPTION 'Bu fonksiyon şu anda kullanılamıyor. Lütfen farklı bir yöntem kullanın.';
  
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_admin TO authenticated;
