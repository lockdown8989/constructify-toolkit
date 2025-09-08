-- Create secure user registration function
CREATE OR REPLACE FUNCTION public.complete_user_registration(
  p_user_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_user_role app_role,
  p_manager_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_manager_id TEXT;
  employee_record_id UUID;
  result JSON;
BEGIN
  -- Generate manager ID if registering as manager
  IF p_user_role = 'manager' THEN
    generated_manager_id := generate_unique_manager_id();
  ELSE
    generated_manager_id := p_manager_id;
  END IF;

  -- Insert or update user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_user_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create or update employee record
  INSERT INTO public.employees (
    user_id,
    name,
    email,
    job_title,
    department,
    site,
    role,
    manager_id,
    status,
    lifecycle,
    start_date,
    salary,
    hourly_rate,
    annual_leave_days,
    sick_leave_days,
    pin_code
  ) VALUES (
    p_user_id,
    COALESCE(p_first_name || ' ' || p_last_name, p_email),
    p_email,
    CASE 
      WHEN p_user_role = 'manager' THEN 'Manager'
      WHEN p_user_role = 'payroll' THEN 'Payroll Administrator'
      ELSE 'Employee'
    END,
    CASE 
      WHEN p_user_role = 'manager' THEN 'Management'
      WHEN p_user_role = 'payroll' THEN 'Finance'
      ELSE 'General'
    END,
    'Main Office',
    p_user_role::TEXT,
    generated_manager_id,
    'Active',
    'Active',
    CURRENT_DATE,
    CASE 
      WHEN p_user_role = 'manager' THEN 75000
      WHEN p_user_role = 'payroll' THEN 55000
      ELSE 45000
    END,
    CASE 
      WHEN p_user_role = 'manager' THEN 36.06
      WHEN p_user_role = 'payroll' THEN 26.44
      ELSE 21.63
    END,
    25,
    10,
    generate_pin_code()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    job_title = EXCLUDED.job_title,
    department = EXCLUDED.department,
    role = EXCLUDED.role,
    manager_id = EXCLUDED.manager_id,
    updated_at = NOW()
  RETURNING id INTO employee_record_id;

  -- Create notification settings
  INSERT INTO public.notification_settings (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Build result
  result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'employee_id', employee_record_id,
    'role', p_user_role,
    'manager_id', generated_manager_id,
    'message', 'User registration completed successfully'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return failure result
    RAISE NOTICE 'Error in complete_user_registration: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Registration failed'
    );
END;
$$;