
-- First, create the missing safe_clean_uuid_field function
CREATE OR REPLACE FUNCTION public.safe_clean_uuid_field(input_text text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
BEGIN
  -- Return NULL if input is null or empty
  IF input_text IS NULL OR input_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Try to cast to UUID, return NULL if invalid
  BEGIN
    RETURN input_text::uuid;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN NULL;
  END;
END;
$$;

-- Drop existing constraints temporarily
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_lifecycle_values_check;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_role_check;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_lifecycle_check;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_status_enum_check;

-- Update all existing lifecycle values to be valid
UPDATE employees SET lifecycle = 'Active' WHERE lifecycle IS NULL OR lifecycle = '';
UPDATE employees SET lifecycle = 'Active' WHERE lifecycle NOT IN ('Active', 'Inactive', 'Terminated');

-- Update all existing status values to be valid
UPDATE employees SET status = 'Active' WHERE status IS NULL OR status = '';
UPDATE employees SET status = 'Active' WHERE status NOT IN ('Active', 'Inactive', 'Pending');

-- Update admin@hrapp.com to have manager (employer) role
WITH admin_user AS (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@hrapp.com'
)
INSERT INTO user_roles (user_id, role)
SELECT id, 'employer'::app_role
FROM admin_user
ON CONFLICT (user_id, role) 
DO NOTHING;

-- Create/update the employee record for the admin user
WITH admin_user AS (
  SELECT id, email
  FROM auth.users 
  WHERE email = 'admin@hrapp.com'
)
INSERT INTO employees (
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
  id,
  'Stanislav Stefanov',
  'Manager',
  'Management',
  'Head Office',
  50000,
  'employer',
  email,
  'Active',
  'Active'
FROM admin_user
ON CONFLICT (user_id) 
DO UPDATE SET
  role = 'employer',
  job_title = 'Manager',
  department = 'Management',
  name = 'Stanislav Stefanov',
  lifecycle = 'Active',
  salary = 50000,
  status = 'Active';

-- Now add the constraints back with the correct values
ALTER TABLE employees ADD CONSTRAINT employees_lifecycle_check 
CHECK (lifecycle IN ('Active', 'Inactive', 'Terminated'));

ALTER TABLE employees ADD CONSTRAINT employees_status_enum_check 
CHECK (status IN ('Active', 'Inactive', 'Pending'));

ALTER TABLE employees ADD CONSTRAINT employees_role_check 
CHECK (role IN ('employee', 'employer', 'admin', 'hr', 'payroll'));
