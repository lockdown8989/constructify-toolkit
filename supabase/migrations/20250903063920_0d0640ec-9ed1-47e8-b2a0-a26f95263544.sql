-- Phase 1: Database Hardening and Integrity Fixes
-- Complete the assign_user_role_secure function with all missing validations

-- Enable replica identity for realtime on critical tables
ALTER TABLE employees REPLICA IDENTITY FULL;
ALTER TABLE user_roles REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE attendance REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;

-- Create comprehensive user registration function (server-side)
CREATE OR REPLACE FUNCTION public.complete_user_registration(
  p_user_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_user_role app_role,
  p_manager_id text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_employee_id uuid;
  generated_manager_id text;
  manager_record record;
  full_name text;
BEGIN
  full_name := TRIM(p_first_name || ' ' || p_last_name);
  
  -- Validate manager ID if provided
  IF p_manager_id IS NOT NULL AND p_user_role IN ('employee', 'payroll') THEN
    SELECT * INTO manager_record
    FROM employees e
    JOIN user_roles ur ON ur.user_id = e.user_id
    WHERE e.manager_id = p_manager_id 
    AND ur.role IN ('admin', 'employer', 'hr', 'manager');
    
    IF manager_record.id IS NULL THEN
      RETURN json_build_object(
        'success', false, 
        'error', 'Invalid manager ID provided'
      );
    END IF;
  END IF;
  
  -- Generate unique manager ID for admin/employer/manager roles
  IF p_user_role IN ('admin', 'employer', 'manager') THEN
    generated_manager_id := public.generate_unique_manager_id();
  END IF;
  
  -- Assign user role
  INSERT INTO user_roles (user_id, role) 
  VALUES (p_user_id, p_user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create employee record
  INSERT INTO employees (
    user_id, name, email, job_title, department, site,
    salary, hourly_rate, start_date, status, lifecycle, role, manager_id
  ) VALUES (
    p_user_id, 
    full_name,
    p_email,
    CASE 
      WHEN p_user_role = 'admin' THEN 'Administrator'
      WHEN p_user_role = 'hr' THEN 'HR Manager'
      WHEN p_user_role = 'employer' THEN 'Department Manager'
      WHEN p_user_role = 'manager' THEN 'Team Manager'
      WHEN p_user_role = 'payroll' THEN 'Payroll Specialist'
      ELSE 'Employee'
    END,
    CASE 
      WHEN p_user_role IN ('admin', 'hr') THEN 'Administration'
      WHEN p_user_role = 'payroll' THEN 'Finance'
      ELSE 'General'
    END,
    'Main Office',
    CASE 
      WHEN p_user_role = 'admin' THEN 75000
      WHEN p_user_role IN ('hr', 'employer', 'manager') THEN 55000
      WHEN p_user_role = 'payroll' THEN 45000
      ELSE 35000
    END,
    CASE 
      WHEN p_user_role IN ('admin', 'hr', 'employer', 'manager') THEN NULL
      ELSE 18.00
    END,
    CURRENT_DATE,
    'Active',
    'Active',
    p_user_role::text,
    COALESCE(p_manager_id, generated_manager_id)
  )
  RETURNING id INTO new_employee_id;
  
  -- Log the registration
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, 
    processed_data, processor_id
  ) VALUES (
    p_user_id, 'user_registration', 'complete_registration', 'user_consent',
    json_build_object(
      'role', p_user_role,
      'manager_id', COALESCE(p_manager_id, generated_manager_id),
      'employee_id', new_employee_id
    ),
    p_user_id
  );
  
  -- Notify manager if employee was assigned
  IF p_manager_id IS NOT NULL AND p_user_role = 'employee' THEN
    INSERT INTO notifications (
      user_id, title, message, type, related_entity, related_id
    )
    SELECT 
      ur.user_id,
      '👤 New Team Member',
      full_name || ' has joined your team as an employee.',
      'info',
      'employee',
      new_employee_id
    FROM user_roles ur
    JOIN employees e ON e.user_id = ur.user_id
    WHERE e.manager_id = p_manager_id
    AND ur.role IN ('admin', 'employer', 'hr', 'manager');
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'employee_id', new_employee_id,
    'manager_id', COALESCE(p_manager_id, generated_manager_id),
    'role_assigned', p_user_role
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Registration failed: ' || SQLERRM
    );
END;
$$;

-- Enhanced assign_user_role_secure with complete validation
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(
  target_user_id uuid,
  new_role app_role,
  requester_manager_id text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_roles app_role[];
  target_employee record;
  manager_record record;
  existing_roles app_role[];
BEGIN
  -- Get requester's roles
  SELECT array_agg(role) INTO requester_roles
  FROM user_roles 
  WHERE user_id = auth.uid();
  
  -- Get target user's existing roles
  SELECT array_agg(role) INTO existing_roles
  FROM user_roles 
  WHERE user_id = target_user_id;
  
  -- Check if requester has permission to assign roles
  IF NOT (requester_roles && ARRAY['admin'::app_role, 'hr'::app_role]) THEN
    -- For employer/manager role, additional validation
    IF requester_roles && ARRAY['employer'::app_role, 'manager'::app_role] THEN
      -- Employers/managers can only assign employee roles, not admin/hr/payroll
      IF new_role IN ('admin', 'hr', 'payroll') THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient permissions to assign this role');
      END IF;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
    END IF;
  END IF;
  
  -- Rate limiting check (max 10 assignments per hour)
  IF EXISTS (
    SELECT 1 FROM data_processing_log 
    WHERE processor_id = auth.uid() 
    AND action_type = 'role_assignment' 
    AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY processor_id 
    HAVING COUNT(*) >= 10
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded: Maximum 10 role assignments per hour');
  END IF;
  
  -- Prevent duplicate role assignments
  IF existing_roles && ARRAY[new_role] THEN
    RETURN json_build_object('success', true, 'message', 'Role already assigned', 'role', new_role);
  END IF;
  
  -- Validate manager ID if provided for employee roles
  IF new_role = 'employee' AND requester_manager_id IS NOT NULL THEN
    SELECT * INTO manager_record
    FROM employees e
    JOIN user_roles ur ON ur.user_id = e.user_id
    WHERE e.manager_id = requester_manager_id 
    AND ur.role IN ('admin', 'employer', 'hr', 'manager');
    
    IF manager_record.id IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Invalid manager ID provided');
    END IF;
  END IF;
  
  -- Insert role (using ON CONFLICT for safety)
  INSERT INTO user_roles (user_id, role) 
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update employee record role if needed
  UPDATE employees 
  SET role = new_role::text, 
      manager_id = COALESCE(requester_manager_id, manager_id),
      updated_at = NOW()
  WHERE user_id = target_user_id;
  
  -- Log the assignment with complete audit trail
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, 
    processed_data, processor_id
  ) VALUES (
    target_user_id, 'role_assignment', 'user_roles', 'legitimate_interests',
    json_build_object(
      'role', new_role, 
      'assigned_by', auth.uid(),
      'manager_id', requester_manager_id,
      'previous_roles', existing_roles,
      'timestamp', NOW()
    ),
    auth.uid()
  );
  
  -- Send notification to target user
  INSERT INTO notifications (
    user_id, title, message, type, related_entity, related_id
  ) VALUES (
    target_user_id,
    '🔑 Role Updated',
    'Your account role has been updated to: ' || new_role::text,
    'info',
    'role_assignment',
    target_user_id
  );
  
  RETURN json_build_object(
    'success', true, 
    'role', new_role,
    'manager_id', requester_manager_id,
    'message', 'Role assigned successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Role assignment failed: ' || SQLERRM
    );
END;
$$;

-- Fix recursive RLS policy issues on leave_calendar
DROP POLICY IF EXISTS "Employees can see own leave" ON leave_calendar;
DROP POLICY IF EXISTS "Employees can manage own leave" ON leave_calendar;
DROP POLICY IF EXISTS "Employees can update own leave" ON leave_calendar;
DROP POLICY IF EXISTS "Employers can manage all leave" ON leave_calendar;

-- Create non-recursive RLS policies for leave_calendar
CREATE POLICY "Employees can view their own leave requests" ON leave_calendar
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = leave_calendar.employee_id 
    AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Management can view all leave requests" ON leave_calendar
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer', 'manager')
  )
);

CREATE POLICY "Employees can create their own leave requests" ON leave_calendar
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = leave_calendar.employee_id 
    AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Employees can update their pending leave requests" ON leave_calendar
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = leave_calendar.employee_id 
    AND e.user_id = auth.uid()
    AND leave_calendar.status = 'Pending'
  )
);

CREATE POLICY "Management can update all leave requests" ON leave_calendar
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer', 'manager')
  )
);

-- Enhanced error handling for manager ID validation
CREATE OR REPLACE FUNCTION public.validate_admin_id(p_admin_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Check format (ADM-#### or MGR-####)
  IF p_admin_id !~ '^(ADM|MGR)-[0-9]{4,5}$' THEN
    RETURN false;
  END IF;
  
  -- Check if ID exists in database
  RETURN EXISTS (
    SELECT 1 FROM employees e
    JOIN user_roles ur ON ur.user_id = e.user_id
    WHERE e.manager_id = p_admin_id
    AND ur.role IN ('admin', 'employer', 'hr', 'manager')
  );
END;
$$;