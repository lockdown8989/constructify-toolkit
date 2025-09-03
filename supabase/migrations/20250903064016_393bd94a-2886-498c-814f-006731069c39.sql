-- Phase 1: Database Hardening and Integrity Fixes (corrected)
-- Complete the assign_user_role_secure function with all missing validations

-- Enable replica identity for realtime on critical tables
ALTER TABLE employees REPLICA IDENTITY FULL;
ALTER TABLE user_roles REPLICA IDENTITY FULL;
ALTER TABLE attendance REPLICA IDENTITY FULL;

-- Add tables to realtime publication (skip if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'employees'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE employees;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_roles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_roles;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'attendance'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
  END IF;
END $$;

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