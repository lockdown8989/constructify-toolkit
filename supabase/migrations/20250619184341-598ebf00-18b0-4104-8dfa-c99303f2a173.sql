
-- Check current role assignment for the user
SELECT 
  ur.user_id,
  ur.role,
  e.name,
  e.email,
  e.job_title,
  e.role as employee_role
FROM user_roles ur
LEFT JOIN employees e ON e.user_id = ur.user_id
WHERE e.email = 'd0bl3@abv.bg' OR ur.user_id IN (
  SELECT id FROM auth.users WHERE email = 'd0bl3@abv.bg'
);

-- Update the user's role to manager/employer
UPDATE user_roles 
SET role = 'employer'::app_role
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'd0bl3@abv.bg'
);

-- Ensure the employee record has the correct role
UPDATE employees 
SET 
  role = 'employer',
  job_title = 'Manager',
  department = 'Management'
WHERE email = 'd0bl3@abv.bg' OR user_id IN (
  SELECT id FROM auth.users WHERE email = 'd0bl3@abv.bg'
);

-- Insert manager role if it doesn't exist
INSERT INTO user_roles (user_id, role)
SELECT id, 'employer'::app_role
FROM auth.users 
WHERE email = 'd0bl3@abv.bg'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the changes
SELECT 
  au.email,
  ur.role as user_role,
  e.name,
  e.job_title,
  e.role as employee_role
FROM auth.users au
LEFT JOIN user_roles ur ON ur.user_id = au.id
LEFT JOIN employees e ON e.user_id = au.id
WHERE au.email = 'd0bl3@abv.bg';
