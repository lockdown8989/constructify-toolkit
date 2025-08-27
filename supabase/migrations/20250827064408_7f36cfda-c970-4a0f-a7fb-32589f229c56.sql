-- CRITICAL SECURITY FIXES

-- 1. FIX USER_ROLES RLS POLICIES - PREVENT PRIVILEGE ESCALATION
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;

-- Create secure user_roles policies that prevent self-privilege escalation
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

CREATE POLICY "Users can view their own roles only" ON public.user_roles
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- 2. SECURE SECURITY DEFINER FUNCTIONS - REVOKE PUBLIC ACCESS
REVOKE EXECUTE ON FUNCTION public.admin_update_user_password(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_reset_user_password(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.safe_delete_user_data(uuid) FROM PUBLIC;

-- Grant only to specific roles that need these functions
GRANT EXECUTE ON FUNCTION public.admin_update_user_password(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reset_user_password(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_user_data(uuid) TO authenticated;

-- Add function guards to prevent unauthorized access
CREATE OR REPLACE FUNCTION public.admin_update_user_password(user_email text, new_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_id UUID;
  result JSON;
BEGIN
  -- SECURITY: Only admins can update passwords
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ) THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized: Admin access required');
  END IF;
  
  -- Get the user ID from email
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Update the user's password using Supabase auth admin functions
  UPDATE auth.users 
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the password update
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, processed_data
  ) VALUES (
    user_id, 'update', 'auth.users', 'administrative_action',
    json_build_object('action', 'password_reset', 'admin_initiated', true)
  );
  
  RETURN json_build_object('success', true, 'message', 'Password updated successfully', 'user_id', user_id);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Error updating password: ' || SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reset_user_password(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_id UUID;
  result JSON;
BEGIN
  -- SECURITY: Only admins can reset passwords
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ) THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized: Admin access required');
  END IF;
  
  -- Get the user ID from email
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Update the user to force a password reset
  UPDATE auth.users 
  SET email_confirmed_at = NOW(), updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the password reset action
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, processed_data
  ) VALUES (
    user_id, 'update', 'auth.users', 'administrative_action',
    json_build_object('action', 'password_reset_initiated', 'admin_initiated', true)
  );
  
  RETURN json_build_object(
    'success', true, 'message', 'Password reset initiated for user',
    'user_id', user_id, 'email', user_email,
    'instructions', 'User should use password reset flow to set new password'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Error initiating password reset: ' || SQLERRM);
END;
$$;

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
  affected_notifications integer := 0;
  affected_schedules integer := 0;
  affected_chats integer := 0;
BEGIN
  -- SECURITY: Only admins or the user themselves can delete user data
  IF NOT (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    ) OR auth.uid() = target_user_id
  ) THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized: Admin access or self-deletion required');
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
    UPDATE notifications SET user_id = NULL WHERE user_id = target_user_id;
    GET DIAGNOSTICS affected_notifications = ROW_COUNT;
    
    -- Handle schedules that reference this employee as manager or creator
    UPDATE schedules SET manager_id = NULL WHERE manager_id::uuid = target_user_id;
    UPDATE schedules SET published_by = NULL WHERE published_by = target_user_id;
    UPDATE schedules SET approved_by = NULL WHERE approved_by = target_user_id;
    UPDATE schedules SET last_dragged_by = NULL WHERE last_dragged_by = target_user_id;
    GET DIAGNOSTICS affected_schedules = ROW_COUNT;
    
    -- Handle chat references - disable chats where this user was admin
    UPDATE chats SET is_active = false WHERE admin_id = employee_record_id OR employee_id = employee_record_id;
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
    UPDATE employees SET manager_id = NULL WHERE manager_id = employee_record_id::text;
    
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
$$;

-- 3. LOCK DOWN AUTH_EVENTS ACCESS - RESTRICT TO ADMINS ONLY
DROP POLICY IF EXISTS "Auth events are viewable by authenticated users" ON public.auth_events;
DROP POLICY IF EXISTS "Auth events can be inserted by any authenticated context" ON public.auth_events;

CREATE POLICY "Only admins can view auth events" ON public.auth_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

CREATE POLICY "Only system can insert auth events" ON public.auth_events
FOR INSERT
TO authenticated
WITH CHECK (false); -- Block all client inserts, only server functions should insert

-- 4. NORMALIZE ATTENDANCE RLS POLICIES - REMOVE DUPLICATES AND INCONSISTENCIES
DROP POLICY IF EXISTS "Employees can manage own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Employees can see own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Employees can update own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Employers can manage all attendance" ON public.attendance;
DROP POLICY IF EXISTS "managers_view_all_attendance" ON public.attendance;
DROP POLICY IF EXISTS "view_own_attendance" ON public.attendance;

-- Create clean, consistent attendance policies
CREATE POLICY "Employees can view their own attendance" ON public.attendance
FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Employees can create their own attendance" ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Employees can update their own attendance" ON public.attendance
FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Management can view all attendance" ON public.attendance
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = ANY(ARRAY['admin'::app_role, 'employer'::app_role, 'hr'::app_role, 'payroll'::app_role])
  )
);

CREATE POLICY "Management can manage all attendance" ON public.attendance
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = ANY(ARRAY['admin'::app_role, 'employer'::app_role, 'hr'::app_role])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = ANY(ARRAY['admin'::app_role, 'employer'::app_role, 'hr'::app_role])
  )
);

-- Add security audit logging
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, details jsonb DEFAULT '{}')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, processed_data
  ) VALUES (
    auth.uid(), 'security_event', 'system', 'security_monitoring',
    jsonb_build_object(
      'event_type', event_type,
      'details', details,
      'timestamp', NOW(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  );
END;
$$;