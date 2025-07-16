-- Create a function to safely delete a user and all related data
-- This function ensures proper deletion order and handles orphaned data

CREATE OR REPLACE FUNCTION public.safe_delete_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  employee_record_id uuid;
  deleted_count integer := 0;
  tables_processed text[] := '{}';
BEGIN
  -- Log the deletion attempt
  RAISE NOTICE 'Starting safe deletion for user: %', target_user_id;
  
  -- Find employee record if exists
  SELECT id INTO employee_record_id 
  FROM employees 
  WHERE user_id = target_user_id;
  
  IF employee_record_id IS NOT NULL THEN
    RAISE NOTICE 'Found employee record: %', employee_record_id;
    
    -- Delete employee-related data in proper order
    -- Tables with employee_id foreign keys
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
    
    tables_processed := array_append(tables_processed, 'employee_related_tables');
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % employee-related records', deleted_count;
    
    -- Delete employee record (this will set user_id to NULL due to constraint)
    DELETE FROM employees WHERE id = employee_record_id;
    tables_processed := array_append(tables_processed, 'employees');
  END IF;
  
  -- Delete user-related data (these should CASCADE if foreign keys are set up)
  DELETE FROM workflow_requests WHERE user_id = target_user_id;
  DELETE FROM notification_settings WHERE user_id = target_user_id;
  DELETE FROM notifications WHERE user_id = target_user_id;
  DELETE FROM user_roles WHERE user_id = target_user_id;
  DELETE FROM profiles WHERE id = target_user_id;
  
  tables_processed := array_append(tables_processed, 'user_related_tables');
  
  -- Check for any remaining orphaned data
  -- This helps identify if we missed any tables
  DECLARE
    orphaned_count integer;
    table_name text;
    check_tables text[] := ARRAY[
      'attendance', 'availability_requests', 'calendar_preferences', 
      'documents', 'leave_calendar', 'notifications', 'payroll', 
      'schedules', 'shift_applications', 'user_roles'
    ];
  BEGIN
    FOR table_name IN SELECT unnest(check_tables) LOOP
      BEGIN
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE user_id = $1 OR employee_id = $2', table_name) 
        INTO orphaned_count 
        USING target_user_id, employee_record_id;
        
        IF orphaned_count > 0 THEN
          RAISE WARNING 'Found % orphaned records in table %', orphaned_count, table_name;
        END IF;
      EXCEPTION 
        WHEN undefined_column THEN
          -- Table doesn't have user_id or employee_id column, skip
          NULL;
        WHEN undefined_table THEN
          -- Table doesn't exist, skip
          NULL;
      END;
    END LOOP;
  END;
  
  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'employee_id', employee_record_id,
    'tables_processed', tables_processed,
    'message', 'User data deletion completed'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error during user deletion: %', SQLERRM;
END;
$$;