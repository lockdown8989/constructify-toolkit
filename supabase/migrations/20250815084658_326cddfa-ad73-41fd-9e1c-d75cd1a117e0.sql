-- Create a comprehensive delete function that handles all cases
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  employee_record_id uuid;
  deleted_count integer := 0;
  tables_processed text[] := '{}';
BEGIN
  -- Log the deletion attempt
  RAISE NOTICE 'Starting comprehensive user account deletion for user: %', target_user_id;
  
  -- Find employee record if exists
  SELECT id INTO employee_record_id 
  FROM employees 
  WHERE user_id = target_user_id;
  
  IF employee_record_id IS NOT NULL THEN
    RAISE NOTICE 'Found employee record: %', employee_record_id;
    
    -- Delete employee-related data in proper order to avoid foreign key conflicts
    DELETE FROM shift_notifications WHERE employee_id = employee_record_id;
    DELETE FROM shift_applications WHERE employee_id = employee_record_id;
    DELETE FROM clock_notifications WHERE employee_id = employee_record_id;
    DELETE FROM employee_location_logs WHERE employee_id = employee_record_id;
    DELETE FROM shift_pattern_assignments WHERE employee_id = employee_record_id;
    DELETE FROM attendance WHERE employee_id = employee_record_id;
    DELETE FROM availability_patterns WHERE employee_id = employee_record_id;
    DELETE FROM availability_requests WHERE employee_id = employee_record_id;
    DELETE FROM calendar_preferences WHERE employee_id = employee_record_id;
    DELETE FROM document_assignments WHERE employee_id = employee_record_id;
    DELETE FROM documents WHERE employee_id = employee_record_id;
    DELETE FROM leave_calendar WHERE employee_id = employee_record_id;
    DELETE FROM open_shift_assignments WHERE employee_id = employee_record_id;
    DELETE FROM payroll WHERE employee_id = employee_record_id;
    DELETE FROM salary_statistics WHERE employee_id = employee_record_id;
    DELETE FROM schedules WHERE employee_id = employee_record_id;
    
    -- Clean up any manager references pointing to this employee
    UPDATE employees 
    SET manager_id = NULL 
    WHERE manager_id = employee_record_id::text;
    
    -- Delete employee record
    DELETE FROM employees WHERE id = employee_record_id;
    tables_processed := array_append(tables_processed, 'employees');
  END IF;
  
  -- Clean up user-related data
  DELETE FROM workflow_requests WHERE user_id = target_user_id;
  DELETE FROM notification_settings WHERE user_id = target_user_id;
  DELETE FROM user_roles WHERE user_id = target_user_id;
  DELETE FROM appearance_settings WHERE user_id = target_user_id;
  DELETE FROM profiles WHERE id = target_user_id;
  DELETE FROM notifications WHERE user_id = target_user_id;
  
  -- Update any remaining foreign key references to prevent broken relationships
  UPDATE attendance SET overtime_approved_by = NULL WHERE overtime_approved_by = target_user_id;
  UPDATE documents SET uploaded_by = NULL WHERE uploaded_by = target_user_id;
  UPDATE availability_requests SET reviewer_id = NULL WHERE reviewer_id = target_user_id;
  
  tables_processed := array_append(tables_processed, 'user_related_tables');
  
  -- Delete from auth.users (this will cascade properly now)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'employee_id', employee_record_id,
    'tables_processed', tables_processed,
    'message', 'User account deletion completed successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error during user account deletion: %', SQLERRM;
END;
$$;

-- Now delete the test users using the function
SELECT public.delete_user_account(id) FROM auth.users WHERE email IN ('test@admin.com', 'test@example.com');