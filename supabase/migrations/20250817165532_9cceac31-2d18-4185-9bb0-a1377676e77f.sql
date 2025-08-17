-- First, create an improved delete_user_account function that handles complete cleanup
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
  RAISE NOTICE 'Starting complete user deletion for user: %', target_user_id;
  
  -- Find employee record if exists
  SELECT id INTO employee_record_id 
  FROM employees 
  WHERE user_id = target_user_id;
  
  IF employee_record_id IS NOT NULL THEN
    RAISE NOTICE 'Found employee record: %', employee_record_id;
    
    -- Delete all employee-related data in proper order to avoid foreign key conflicts
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
    
    -- Delete the employee record itself
    DELETE FROM employees WHERE id = employee_record_id;
    
    tables_processed := array_append(tables_processed, 'employee_related_tables');
  END IF;
  
  -- Clean up all user-related data
  DELETE FROM workflow_requests WHERE user_id = target_user_id;
  DELETE FROM notification_settings WHERE user_id = target_user_id;
  DELETE FROM user_roles WHERE user_id = target_user_id;
  DELETE FROM appearance_settings WHERE user_id = target_user_id;
  DELETE FROM notifications WHERE user_id = target_user_id;
  DELETE FROM profiles WHERE id = target_user_id;
  DELETE FROM user_chat_notifications WHERE user_id = target_user_id;
  DELETE FROM user_presence WHERE user_id = target_user_id;
  DELETE FROM chat_participants WHERE user_id = target_user_id;
  
  -- Update any remaining foreign key references to prevent broken relationships
  UPDATE attendance SET overtime_approved_by = NULL WHERE overtime_approved_by = target_user_id;
  UPDATE documents SET uploaded_by = NULL WHERE uploaded_by = target_user_id;
  UPDATE availability_requests SET reviewer_id = NULL WHERE reviewer_id = target_user_id;
  UPDATE chats SET admin_id = NULL WHERE admin_id IN (
    SELECT id FROM employees WHERE user_id = target_user_id
  );
  
  tables_processed := array_append(tables_processed, 'user_related_tables');
  
  -- Log successful deletion
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, processed_data
  ) VALUES (
    NULL, 'delete', 'user_account', 'user_request',
    jsonb_build_object(
      'deleted_user_id', target_user_id,
      'employee_id', employee_record_id,
      'deletion_timestamp', NOW()
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'employee_id', employee_record_id,
    'tables_processed', tables_processed,
    'message', 'Complete user data deletion completed successfully'
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
$$;

-- Now delete all existing users and their data
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Delete all users one by one to ensure proper cleanup
    FOR user_record IN SELECT id FROM auth.users LOOP
        -- Use our comprehensive deletion function
        PERFORM public.delete_user_account(user_record.id);
        
        -- Delete from auth.users (this is the final step)
        -- Note: This would normally be done by Supabase admin functions
        RAISE NOTICE 'Cleaned up data for user: %', user_record.id;
    END LOOP;
END $$;