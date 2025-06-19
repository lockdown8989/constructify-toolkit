
-- First, let's remove any duplicate or problematic employee records for Vicky
DELETE FROM employees 
WHERE name = 'Vicky Stefanova' 
AND user_id IS NULL;

-- Restore Stanislav Stefanov admin account with manager role (this should work)
WITH admin_user AS (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@hrapp.com'
)
INSERT INTO user_roles (user_id, role)
SELECT id, 'employer'::app_role
FROM admin_user
WHERE EXISTS (SELECT 1 FROM admin_user)
ON CONFLICT (user_id, role) 
DO NOTHING;

-- Create/update employee record for Stanislav Stefanov
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
  'HR Manager',
  'Management',
  'Head Office',
  65000,
  'employer',
  email,
  'Active',
  'Active'
FROM admin_user
WHERE EXISTS (SELECT 1 FROM admin_user)
ON CONFLICT (user_id) 
DO UPDATE SET
  role = 'employer',
  job_title = 'HR Manager',
  department = 'Management',
  name = 'Stanislav Stefanov',
  lifecycle = 'Active',
  salary = 65000,
  status = 'Active';

-- Create/update profile for Stanislav Stefanov
WITH admin_user AS (
  SELECT id FROM auth.users WHERE email = 'admin@hrapp.com'
)
INSERT INTO profiles (id, first_name, last_name, department, position)
SELECT id, 'Stanislav', 'Stefanov', 'Management', 'HR Manager'
FROM admin_user
WHERE EXISTS (SELECT 1 FROM admin_user)
ON CONFLICT (id) 
DO UPDATE SET
  first_name = 'Stanislav',
  last_name = 'Stefanov',
  department = 'Management',
  position = 'HR Manager';

-- Handle Vicky Stefanova more carefully
-- First check if she already has a user account
WITH vicky_user AS (
  SELECT id, email
  FROM auth.users 
  WHERE email = 'vicky.stefanova@example.com'
)
INSERT INTO user_roles (user_id, role)
SELECT id, 'payroll'::app_role
FROM vicky_user
WHERE EXISTS (SELECT 1 FROM vicky_user)
ON CONFLICT (user_id, role) 
DO NOTHING;

-- Update existing employee record for Vicky or create new one
WITH vicky_user AS (
  SELECT id, email
  FROM auth.users 
  WHERE email = 'vicky.stefanova@example.com'
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
  'Vicky Stefanova',
  'Payroll Administrator',
  'Finance',
  'Head Office',
  48000,
  'payroll',
  email,
  'Active',
  'Active'
FROM vicky_user
WHERE EXISTS (SELECT 1 FROM vicky_user)
ON CONFLICT (user_id) 
DO UPDATE SET
  role = 'payroll',
  job_title = 'Payroll Administrator',
  department = 'Finance',
  name = 'Vicky Stefanova',
  lifecycle = 'Active',
  salary = 48000,
  status = 'Active';

-- Only create placeholder if no user exists and no employee record exists
INSERT INTO employees (
  name,
  job_title,
  department,
  site,
  salary,
  role,
  email,
  status,
  lifecycle,
  user_id
)
SELECT 
  'Vicky Stefanova - Payroll',
  'Payroll Administrator',
  'Finance',
  'Head Office',
  48000,
  'payroll',
  'vicky.stefanova@example.com',
  'Active',
  'Active',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'vicky.stefanova@example.com'
) AND NOT EXISTS (
  SELECT 1 FROM employees WHERE email = 'vicky.stefanova@example.com'
);

-- Create/update profile for Vicky Stefanova if user exists
WITH vicky_user AS (
  SELECT id FROM auth.users WHERE email = 'vicky.stefanova@example.com'
)
INSERT INTO profiles (id, first_name, last_name, department, position)
SELECT id, 'Vicky', 'Stefanova', 'Finance', 'Payroll Administrator'
FROM vicky_user
WHERE EXISTS (SELECT 1 FROM vicky_user)
ON CONFLICT (id) 
DO UPDATE SET
  first_name = 'Vicky',
  last_name = 'Stefanova',
  department = 'Finance',
  position = 'Payroll Administrator';
