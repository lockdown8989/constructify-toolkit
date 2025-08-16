-- Create a simple, robust manager validation function
CREATE OR REPLACE FUNCTION validate_manager_id_strict(p_manager_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    manager_record record;
BEGIN
    -- Validate format first
    IF p_manager_id IS NULL OR p_manager_id !~ '^MGR-[0-9]{5}$' THEN
        RETURN json_build_object('valid', false, 'error', 'Invalid manager ID format. Must be MGR-XXXXX');
    END IF;
    
    -- Look for a manager with this manager_id who has management privileges
    SELECT e.id, e.user_id, e.name, e.manager_id, ur.role 
    INTO manager_record
    FROM employees e
    JOIN user_roles ur ON ur.user_id = e.user_id
    WHERE e.manager_id = p_manager_id 
    AND ur.role IN ('admin', 'employer', 'hr', 'manager')
    LIMIT 1;
    
    IF manager_record.id IS NOT NULL THEN
        RETURN json_build_object(
            'valid', true,
            'manager_name', manager_record.name,
            'manager_user_id', manager_record.user_id,
            'manager_role', manager_record.role
        );
    ELSE
        RETURN json_build_object('valid', false, 'error', 'Manager ID not found or user does not have management privileges');
    END IF;
END;
$$;