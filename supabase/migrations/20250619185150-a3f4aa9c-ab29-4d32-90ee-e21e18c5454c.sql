
-- First, let's check the current state of Stan Stefanov's account
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data,
  ur.role as user_role,
  e.role as employee_role,
  e.job_title,
  e.name
FROM auth.users au
LEFT JOIN user_roles ur ON ur.user_id = au.id
LEFT JOIN employees e ON e.user_id = au.id
WHERE au.email = 'd0bl3@abv.bg';

-- Update user_roles to ensure Stan has the correct manager role
UPDATE user_roles 
SET role = 'employer'::app_role
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'd0bl3@abv.bg'
);

-- If no user_roles record exists, insert one
INSERT INTO user_roles (user_id, role)
SELECT id, 'employer'::app_role
FROM auth.users 
WHERE email = 'd0bl3@abv.bg'
  AND id NOT IN (SELECT user_id FROM user_roles);

-- Update the employee record to match
UPDATE employees 
SET 
  role = 'employer',
  job_title = 'Manager',
  department = COALESCE(NULLIF(department, ''), 'Management')
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'd0bl3@abv.bg'
);

-- Update the auth user metadata to be consistent
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"user_role": "manager"}'::jsonb
WHERE email = 'd0bl3@abv.bg';

-- Verify the changes
SELECT 
  'After Update' as status,
  au.email,
  ur.role as user_role,
  e.role as employee_role,
  e.job_title,
  au.raw_user_meta_data
FROM auth.users au
LEFT JOIN user_roles ur ON ur.user_id = au.id
LEFT JOIN employees e ON e.user_id = au.id
WHERE au.email = 'd0bl3@abv.bg';
