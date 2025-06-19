
-- Check and fix manager role assignments and ensure proper data sync
-- First, let's ensure all users with 'employer' role (which maps to 'manager' in UI) have proper employee records

-- Sync payroll user data to ensure all role-based users have proper records
SELECT sync_payroll_user_data();

-- Check if manager users have proper employee records and roles
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
  lifecycle
)
SELECT 
  ur.user_id,
  COALESCE(p.first_name || ' ' || p.last_name, au.email, 'Manager User'),
  'Manager',
  'Management',
  'Head Office',
  55000,
  'employer',
  au.email,
  'Active',
  'Active'
FROM user_roles ur
JOIN auth.users au ON au.id = ur.user_id
LEFT JOIN profiles p ON p.id = ur.user_id
LEFT JOIN employees e ON e.user_id = ur.user_id
WHERE ur.role = 'employer'
AND e.id IS NULL
ON CONFLICT (user_id) DO UPDATE SET
  role = 'employer',
  job_title = COALESCE(NULLIF(employees.job_title, ''), 'Manager'),
  department = COALESCE(NULLIF(employees.department, ''), 'Management');

-- Ensure HR users also have proper employee records
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
  lifecycle
)
SELECT 
  ur.user_id,
  COALESCE(p.first_name || ' ' || p.last_name, au.email, 'HR Manager'),
  'HR Manager',
  'Human Resources',
  'Head Office',
  50000,
  'hr',
  au.email,
  'Active',
  'Active'
FROM user_roles ur
JOIN auth.users au ON au.id = ur.user_id
LEFT JOIN profiles p ON p.id = ur.user_id
LEFT JOIN employees e ON e.user_id = ur.user_id
WHERE ur.role = 'hr'
AND e.id IS NULL
ON CONFLICT (user_id) DO UPDATE SET
  role = 'hr',
  job_title = COALESCE(NULLIF(employees.job_title, ''), 'HR Manager'),
  department = COALESCE(NULLIF(employees.department, ''), 'Human Resources');

-- Ensure admin users also have proper employee records
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
  lifecycle
)
SELECT 
  ur.user_id,
  COALESCE(p.first_name || ' ' || p.last_name, au.email, 'Administrator'),
  'Administrator',
  'Administration',
  'Head Office',
  60000,
  'admin',
  au.email,
  'Active',
  'Active'
FROM user_roles ur
JOIN auth.users au ON au.id = ur.user_id
LEFT JOIN profiles p ON p.id = ur.user_id
LEFT JOIN employees e ON e.user_id = ur.user_id
WHERE ur.role = 'admin'
AND e.id IS NULL
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  job_title = COALESCE(NULLIF(employees.job_title, ''), 'Administrator'),
  department = COALESCE(NULLIF(employees.department, ''), 'Administration');

-- Update the handle_new_user function to ensure it properly handles manager role creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with error handling
  BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''), 
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Insert user role with proper mapping
  BEGIN
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
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create user role for user %: %', NEW.id, SQLERRM;
      -- Try to insert a default employee role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'employee'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
  END;
  
  -- Create employee record for all user types including managers
  BEGIN
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
      COALESCE(
        TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')),
        NEW.email,
        'New User'
      ),
      CASE 
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 'Manager'
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'admin' THEN 'Administrator'
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'hr' THEN 'HR Manager'
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 'Payroll Administrator'
        ELSE 'Employee'
      END,
      CASE 
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 'Management'
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'admin' THEN 'Administration'
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'hr' THEN 'Human Resources'
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 'Finance'
        ELSE 'General'
      END,
      'Head Office',
      CASE 
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'admin' THEN 60000
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 55000
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'hr' THEN 50000
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 45000
        ELSE 35000
      END,
      CASE 
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 'employer'
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'admin' THEN 'admin'
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'hr' THEN 'hr'
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 'payroll'
        ELSE 'employee'
      END,
      NEW.email,
      'Active',
      'Active',
      NEW.raw_user_meta_data->>'manager_id'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create employee record for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$function$;
