-- Function to ensure DÖF integrity for sube_kalite users
CREATE OR REPLACE FUNCTION ensure_dof_integrity()
RETURNS TRIGGER AS $$
DECLARE
    user_role text[];
    user_facility int;
    user_org uuid;
BEGIN
    -- Get current user details
    SELECT role, facility_id, organization_id
    INTO user_role, user_facility, user_org
    FROM public.users
    WHERE id = auth.uid();

    -- If user is sube_kalite, enforce their facility and organization
    IF 'sube_kalite' = ANY(user_role) THEN
        -- Override ANY facility_id sent by frontend with user's actual facility
        NEW.facility_id := user_facility;
        -- Ensure organization_id is set correctly
        NEW.organization_id := user_org;
    END IF;
    
    -- If organization_id is missing for anyone, try to fill it from user
    IF NEW.organization_id IS NULL AND user_org IS NOT NULL THEN
        NEW.organization_id := user_org;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_ensure_dof_integrity ON public.dofs;

CREATE TRIGGER trigger_ensure_dof_integrity
    BEFORE INSERT ON public.dofs
    FOR EACH ROW
    EXECUTE FUNCTION ensure_dof_integrity();
