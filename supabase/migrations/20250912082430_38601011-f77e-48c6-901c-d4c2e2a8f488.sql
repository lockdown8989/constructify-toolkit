-- Fix the safe_delete_user_data function to handle missing tables and foreign key constraints properly
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
  caller_role app_role;
BEGIN
  -- Authorization check: Only admins or the user themselves can delete user data
  SELECT role INTO caller_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  AND role = 'admin'
  LIMIT 1;
  
  IF caller_role != 'admin' AND auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Insufficient permissions to delete user data';
  END IF;
  
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
    -- Only delete from tables that exist
    DELETE FROM shift_notifications WHERE employee_id = employee_record_id;
    DELETE FROM shift_applications WHERE employee_id = employee_record_id;
    DELETE FROM clock_notifications WHERE employee_id = employee_record_id;
    DELETE FROM employee_location_logs WHERE employee_id = employee_record_id;
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
  
  -- Fix foreign key constraint issues by nullifying references in data_processing_log
  UPDATE data_processing_log SET processor_id = NULL WHERE processor_id = target_user_id;
  UPDATE data_processing_log SET user_id = NULL WHERE user_id = target_user_id;
  
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
      'deleted_by', auth.uid(),
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
    'message', 'User data deletion completed successfully with authorization and foreign key cleanup'
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
        'caller_id', auth.uid(),
        'error_message', SQLERRM,
        'error_timestamp', NOW()
      )
    );
    RAISE EXCEPTION 'Error during user deletion: %', SQLERRM;
END;
$function$;

-- Also create a function to clean up old inactive users (older than 30 days with no activity)
CREATE OR REPLACE FUNCTION public.cleanup_inactive_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  inactive_users uuid[];
  user_id uuid;
  cleanup_count integer := 0;
  error_count integer := 0;
BEGIN
  -- Only admins can run this cleanup
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can cleanup inactive users';
  END IF;
  
  -- Find users who haven't been active in 30+ days and have no employee records
  SELECT array_agg(au.id) INTO inactive_users
  FROM auth.users au
  LEFT JOIN public.employees e ON e.user_id = au.id
  LEFT JOIN public.profiles p ON p.id = au.id
  WHERE au.last_sign_in_at < NOW() - INTERVAL '30 days'
    AND e.id IS NULL  -- No employee record
    AND p.id IS NULL  -- No profile record
    AND au.created_at < NOW() - INTERVAL '7 days'  -- Account created more than 7 days ago
  LIMIT 50;  -- Process in batches
  
  IF inactive_users IS NULL OR array_length(inactive_users, 1) = 0 THEN
    RETURN json_build_object(
      'success', true,
      'message', 'No inactive users found to cleanup',
      'cleaned_up', 0,
      'errors', 0
    );
  END IF;
  
  -- Process each inactive user
  FOREACH user_id IN ARRAY inactive_users
  LOOP
    BEGIN
      PERFORM public.safe_delete_user_data(user_id);
      cleanup_count := cleanup_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        RAISE NOTICE 'Failed to cleanup user %: %', user_id, SQLERRM;
    END;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'message', format('Cleanup completed: %s users processed', array_length(inactive_users, 1)),
    'cleaned_up', cleanup_count,
    'errors', error_count,
    'processed_users', inactive_users
  );
END;
$function$;