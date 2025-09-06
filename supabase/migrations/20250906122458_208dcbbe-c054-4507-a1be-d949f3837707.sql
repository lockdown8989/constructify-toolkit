-- Delete old test users and fix role inconsistencies
-- Clean up the problematic test users
DELETE FROM employees WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('d0bl3@abv.bg', 'thrivolve0@gmail.com', 'teamfreestyl3@gmail.com')
);

DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('d0bl3@abv.bg', 'thrivolve0@gmail.com', 'teamfreestyl3@gmail.com')
);

-- Delete the users themselves
DELETE FROM auth.users WHERE email IN ('d0bl3@abv.bg', 'thrivolve0@gmail.com', 'teamfreestyl3@gmail.com');

-- Fix any remaining role sync issues - ensure employees.role matches user_roles.role
UPDATE employees 
SET role = ur.role::text
FROM user_roles ur 
WHERE employees.user_id = ur.user_id 
AND employees.role != ur.role::text;