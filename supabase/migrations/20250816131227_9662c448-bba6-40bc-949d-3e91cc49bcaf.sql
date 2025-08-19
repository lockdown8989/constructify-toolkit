-- Fix the manual deletion with proper variable naming
DO $$
DECLARE
    test_user_ids uuid[];
    target_user_id uuid;
BEGIN
    -- Get user IDs first
    SELECT array_agg(id) INTO test_user_ids
    FROM auth.users 
    WHERE email IN ('test@admin.com', 'test@example.com');
    
    -- Process each user
    FOREACH target_user_id IN ARRAY COALESCE(test_user_ids, ARRAY[]::uuid[])
    LOOP
        -- Delete user-related data
        DELETE FROM user_roles WHERE user_roles.user_id = target_user_id;
        DELETE FROM profiles WHERE profiles.id = target_user_id;
        DELETE FROM notification_settings WHERE notification_settings.user_id = target_user_id;
        DELETE FROM appearance_settings WHERE appearance_settings.user_id = target_user_id;
        DELETE FROM notifications WHERE notifications.user_id = target_user_id;
        
        -- Find and delete employee data
        DELETE FROM employees WHERE employees.user_id = target_user_id;
        
        -- Delete auth user
        DELETE FROM auth.users WHERE auth.users.id = target_user_id;
        
        RAISE NOTICE 'Deleted test user: %', target_user_id;
    END LOOP;
END $$;

-- Create strict manager validation function to prevent data mixing
CREATE OR REPLACE FUNCTION public.validate_manager_id_strict(p_manager_id text, p_requesting_user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    manager_record record;
    requesting_employee record;
BEGIN
    -- Validate format
    IF p_manager_id IS NULL OR NOT p_manager_id ~ '^MGR-[0-9]{5}$' THEN
        RETURN json_build_object('valid', false, 'error', 'Invalid manager ID format');
    END IF;
    
    -- Find manager by manager_id (the manager should have this ID)
    SELECT e.id, e.user_id, e.name, e.manager_id, ur.role 
    INTO manager_record
    FROM employees e
    LEFT JOIN user_roles ur ON ur.user_id = e.user_id
    WHERE e.manager_id = p_manager_id 
    AND ur.role IN ('manager', 'admin', 'employer', 'hr')
    LIMIT 1;
    
    IF manager_record IS NULL THEN
        RETURN json_build_object('valid', false, 'error', 'Manager ID not found or invalid');
    END IF;
    
    -- If this is for employee registration, ensure no cross-contamination
    IF p_requesting_user_id IS NOT NULL THEN
        SELECT id, manager_id INTO requesting_employee
        FROM employees 
        WHERE user_id = p_requesting_user_id;
        
        -- If user already has employee record with different manager, prevent mixing
        IF requesting_employee IS NOT NULL AND 
           requesting_employee.manager_id IS NOT NULL AND 
           requesting_employee.manager_id != p_manager_id THEN
            RETURN json_build_object('valid', false, 'error', 'Cannot change manager - data isolation required');
        END IF;
    END IF;
    
    RETURN json_build_object(
        'valid', true, 
        'manager_name', manager_record.name,
        'manager_user_id', manager_record.user_id,
        'manager_role', manager_record.role
    );
END;
$$;