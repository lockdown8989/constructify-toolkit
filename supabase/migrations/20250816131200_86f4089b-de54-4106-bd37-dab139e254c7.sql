-- Temporarily disable the trigger to clean up test users
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Manually delete test users and their related data
DO $$
DECLARE
    test_user_ids uuid[];
    user_id uuid;
BEGIN
    -- Get user IDs first
    SELECT array_agg(id) INTO test_user_ids
    FROM auth.users 
    WHERE email IN ('test@admin.com', 'test@example.com');
    
    -- Process each user
    FOREACH user_id IN ARRAY COALESCE(test_user_ids, ARRAY[]::uuid[])
    LOOP
        -- Delete user-related data
        DELETE FROM user_roles WHERE user_id = user_id;
        DELETE FROM profiles WHERE id = user_id;
        DELETE FROM notification_settings WHERE user_id = user_id;
        DELETE FROM appearance_settings WHERE user_id = user_id;
        DELETE FROM notifications WHERE user_id = user_id;
        
        -- Find and delete employee data
        DELETE FROM employees WHERE user_id = user_id;
        
        -- Delete auth user
        DELETE FROM auth.users WHERE id = user_id;
        
        RAISE NOTICE 'Deleted test user: %', user_id;
    END LOOP;
END $$;

-- Add RLS policy to ensure employees only see data from their manager's team
CREATE POLICY "Employees see only their manager team data" 
ON employees 
FOR SELECT 
USING (
  -- Allow if current user is the employee themselves
  user_id = auth.uid() 
  OR 
  -- Allow if current user has management roles
  (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'employer', 'hr', 'manager', 'payroll')
  ))
  OR
  -- Allow if current user is an employee under the same manager_id
  (EXISTS (
    SELECT 1 FROM employees current_emp 
    WHERE current_emp.user_id = auth.uid() 
    AND current_emp.manager_id = employees.manager_id
    AND current_emp.manager_id IS NOT NULL
  ))
);

-- Update manager validator to ensure strict MGR ID matching
CREATE OR REPLACE FUNCTION public.validate_manager_id_strict(p_manager_id text, p_requesting_user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    manager_employee record;
    requesting_user_employee record;
BEGIN
    -- Validate format
    IF p_manager_id IS NULL OR NOT p_manager_id ~ '^MGR-[0-9]{5}$' THEN
        RETURN json_build_object('valid', false, 'error', 'Invalid manager ID format');
    END IF;
    
    -- Find the manager employee by manager_id
    SELECT id, user_id, name, manager_id INTO manager_employee
    FROM employees 
    WHERE manager_id = p_manager_id AND user_id IS NOT NULL
    LIMIT 1;
    
    IF manager_employee IS NULL THEN
        RETURN json_build_object('valid', false, 'error', 'Manager ID not found');
    END IF;
    
    -- If this is for employee registration, ensure no cross-contamination
    IF p_requesting_user_id IS NOT NULL THEN
        SELECT id, manager_id INTO requesting_user_employee
        FROM employees 
        WHERE user_id = p_requesting_user_id;
        
        -- If user already has employee record with different manager, prevent mixing
        IF requesting_user_employee IS NOT NULL AND 
           requesting_user_employee.manager_id IS NOT NULL AND 
           requesting_user_employee.manager_id != p_manager_id THEN
            RETURN json_build_object('valid', false, 'error', 'Cannot change manager - data isolation required');
        END IF;
    END IF;
    
    RETURN json_build_object(
        'valid', true, 
        'manager_name', manager_employee.name,
        'manager_user_id', manager_employee.user_id
    );
END;
$$;