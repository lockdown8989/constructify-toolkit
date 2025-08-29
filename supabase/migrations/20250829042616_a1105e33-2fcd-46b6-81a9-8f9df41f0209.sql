-- Security Fix Migration: Address Critical Vulnerabilities

-- 1. Fix user_roles RLS policies to prevent privilege escalation
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;

-- Create secure RLS policies for user_roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles" ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- 2. Revoke EXECUTE privileges on dangerous SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.safe_delete_user_data(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.export_user_data(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.anonymize_user_data(uuid) FROM PUBLIC;

-- Grant EXECUTE only to admins via a new role
CREATE ROLE admin_functions;
GRANT EXECUTE ON FUNCTION public.safe_delete_user_data(uuid) TO admin_functions;
GRANT EXECUTE ON FUNCTION public.export_user_data(uuid) TO admin_functions;
GRANT EXECUTE ON FUNCTION public.anonymize_user_data(uuid) TO admin_functions;

-- 3. Create secure role assignment function
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id UUID,
  new_role app_role
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role app_role;
BEGIN
  -- Get caller's role
  SELECT role INTO caller_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'hr' THEN 2  
      WHEN 'employer' THEN 3
      WHEN 'payroll' THEN 4
      WHEN 'employee' THEN 5
    END
  LIMIT 1;
  
  -- Only admins can assign roles
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Insufficient permissions to assign roles';
  END IF;
  
  -- Validate the new role
  IF new_role NOT IN ('admin', 'hr', 'employer', 'payroll', 'employee') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;
  
  -- Remove existing roles for the user
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Insert the new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role);
  
  -- Log the role assignment
  INSERT INTO public.data_processing_log (
    user_id, action_type, table_name, legal_basis, processed_data
  ) VALUES (
    target_user_id, 'update', 'user_roles', 'legitimate_interests',
    jsonb_build_object(
      'assigned_by', auth.uid(),
      'new_role', new_role,
      'timestamp', NOW()
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'role', new_role
  );
END;
$$;

-- Grant execute to admins only
REVOKE EXECUTE ON FUNCTION public.assign_user_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, app_role) TO admin_functions;

-- 4. Fix documents table policies - remove conflicting policies
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Employers can delete documents" ON public.documents;
DROP POLICY IF EXISTS "Employers can update documents" ON public.documents;
DROP POLICY IF EXISTS "Employers can upload documents" ON public.documents;
DROP POLICY IF EXISTS "Employers can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Managers can delete any document" ON public.documents;
DROP POLICY IF EXISTS "Managers can insert documents for any employee" ON public.documents;
DROP POLICY IF EXISTS "Managers can update any document" ON public.documents;
DROP POLICY IF EXISTS "Managers can view all documents" ON public.documents;

-- Create normalized document policies
CREATE POLICY "Employees can view assigned documents" ON public.documents
FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Management can manage all documents" ON public.documents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer', 'payroll')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer', 'payroll')
  )
);

-- 5. Add authorization to safe_delete_user_data
CREATE OR REPLACE FUNCTION public.safe_delete_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;