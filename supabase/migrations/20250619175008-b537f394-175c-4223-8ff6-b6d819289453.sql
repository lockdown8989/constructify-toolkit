
-- Ensure proper user role assignment and dashboard routing
-- Update the handle_new_user function to properly handle role metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile first
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  
  -- Insert user role with proper role mapping and error handling
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    CASE 
      WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 'employer'::app_role
      WHEN (NEW.raw_user_meta_data->>'user_role') = 'admin' THEN 'admin'::app_role
      WHEN (NEW.raw_user_meta_data->>'user_role') = 'hr' THEN 'hr'::app_role
      WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 'payroll'::app_role
      ELSE 'employee'::app_role
    END
  );
  
  -- Create employee record if needed (for manager, payroll, or employee roles)
  IF (NEW.raw_user_meta_data->>'user_role') IN ('manager', 'employee', 'payroll') THEN
    INSERT INTO public.employees (
      user_id,
      name,
      job_title,
      department,
      site,
      salary,
      role,
      email,
      status,
      lifecycle,
      manager_id
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name', 'New User'),
      CASE 
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 'Manager'
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 'Payroll Administrator'
        ELSE 'Employee'
      END,
      CASE 
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 'Finance'
        ELSE 'General'
      END,
      'Head Office',
      CASE 
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 55000
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 45000
        ELSE 35000
      END,
      CASE 
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 'employer'
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 'payroll'
        ELSE 'employee'
      END,
      NEW.email,
      'Active',
      'Active',
      NEW.raw_user_meta_data->>'manager_id'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Also create a function to check user dashboard access
CREATE OR REPLACE FUNCTION public.get_user_dashboard_type(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
BEGIN
  -- Get the user's primary role
  SELECT role::text INTO user_role
  FROM public.user_roles
  WHERE user_id = p_user_id
  ORDER BY 
    CASE role::text
      WHEN 'admin' THEN 1
      WHEN 'hr' THEN 2
      WHEN 'employer' THEN 3
      WHEN 'payroll' THEN 4
      ELSE 5
    END
  LIMIT 1;
  
  -- Return dashboard type based on role
  RETURN CASE 
    WHEN user_role = 'payroll' THEN 'payroll'
    WHEN user_role IN ('admin', 'hr', 'employer') THEN 'manager'
    ELSE 'employee'
  END;
END;
$function$;
