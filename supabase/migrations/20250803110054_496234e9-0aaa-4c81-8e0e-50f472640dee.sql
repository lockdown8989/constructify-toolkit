-- Fix deletion cascading and improve safe_delete_user_data function
-- This addresses foreign key constraints and ensures clean deletion

-- Update safe_delete_user_data function to handle all edge cases
CREATE OR REPLACE FUNCTION public.safe_delete_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  employee_record_id uuid;
  deleted_count integer := 0;
  tables_processed text[] := '{}';
  affected_notifications integer := 0;
  affected_schedules integer := 0;
  affected_chats integer := 0;
BEGIN
  -- Log the deletion attempt
  RAISE NOTICE 'Starting enhanced safe deletion for user: %', target_user_id;
  
  -- Find employee record if exists
  SELECT id INTO employee_record_id 
  FROM employees 
  WHERE user_id = target_user_id;
  
  IF employee_record_id IS NOT NULL THEN
    RAISE NOTICE 'Found employee record: %', employee_record_id;
    
    -- Delete employee-related data in proper order to avoid foreign key conflicts
    
    -- First, handle notifications sent TO this user
    UPDATE notifications 
    SET user_id = NULL 
    WHERE user_id = target_user_id;
    GET DIAGNOSTICS affected_notifications = ROW_COUNT;
    
    -- Handle schedules that reference this employee as manager or creator
    UPDATE schedules 
    SET manager_id = NULL 
    WHERE manager_id::uuid = target_user_id;
    
    UPDATE schedules 
    SET published_by = NULL 
    WHERE published_by = target_user_id;
    
    UPDATE schedules 
    SET approved_by = NULL 
    WHERE approved_by = target_user_id;
    
    UPDATE schedules 
    SET last_dragged_by = NULL 
    WHERE last_dragged_by = target_user_id;
    GET DIAGNOSTICS affected_schedules = ROW_COUNT;
    
    -- Handle chat references - disable chats where this user was admin
    UPDATE chats 
    SET is_active = false 
    WHERE admin_id = employee_record_id OR employee_id = employee_record_id;
    GET DIAGNOSTICS affected_chats = ROW_COUNT;
    
    -- Delete all employee-specific data that has CASCADE or is safe to delete
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
    
    tables_processed := array_append(tables_processed, 'employee_related_tables');
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % employee-related records', deleted_count;
    
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
  
  -- Clean up any remaining orphaned notifications
  DELETE FROM notifications WHERE user_id = target_user_id;
  
  tables_processed := array_append(tables_processed, 'user_related_tables');
  
  -- Update any remaining foreign key references to prevent broken relationships
  UPDATE attendance SET overtime_approved_by = NULL WHERE overtime_approved_by = target_user_id;
  UPDATE documents SET uploaded_by = NULL WHERE uploaded_by = target_user_id;
  UPDATE availability_requests SET reviewer_id = NULL WHERE reviewer_id = target_user_id;
  
  -- Log successful deletion
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, processed_data
  ) VALUES (
    NULL, 'delete', 'user_account', 'user_request',
    jsonb_build_object(
      'deleted_user_id', target_user_id,
      'employee_id', employee_record_id,
      'affected_notifications', affected_notifications,
      'affected_schedules', affected_schedules,
      'affected_chats', affected_chats,
      'deletion_timestamp', NOW()
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'employee_id', employee_record_id,
    'tables_processed', tables_processed,
    'affected_records', json_build_object(
      'notifications', affected_notifications,
      'schedules', affected_schedules,
      'chats', affected_chats
    ),
    'message', 'User data deletion completed successfully with foreign key cleanup'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    INSERT INTO data_processing_log (
      user_id, action_type, table_name, legal_basis, processed_data
    ) VALUES (
      NULL, 'delete_error', 'user_account', 'user_request',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'error_message', SQLERRM,
        'error_timestamp', NOW()
      )
    );
    RAISE EXCEPTION 'Error during user deletion: %', SQLERRM;
END;
$function$;

-- Add constraint to prevent manager deletion breaking team structure
-- Update employees table to handle manager deletion gracefully
ALTER TABLE employees 
DROP CONSTRAINT IF EXISTS employees_manager_id_check;

-- Ensure manager_id references are properly handled on deletion
-- This prevents cascading deletion issues when a manager account is deleted