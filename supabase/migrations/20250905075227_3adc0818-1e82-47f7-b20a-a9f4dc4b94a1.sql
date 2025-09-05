-- Clean up old test users and fix any role inconsistencies
-- Delete users without proper role assignments
DELETE FROM employees WHERE user_id IS NULL OR email IS NULL;
DELETE FROM user_roles WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Clean up any users that don't have matching employee records
WITH orphaned_users AS (
  SELECT u.id, u.email 
  FROM auth.users u 
  LEFT JOIN employees e ON e.user_id = u.id 
  WHERE e.id IS NULL 
  AND u.email NOT LIKE '%@supabase.%'  -- Don't delete system users
)
SELECT * FROM orphaned_users;

-- Fix role synchronization - ensure user_roles table is the source of truth
-- Remove employee role field conflicts where user_roles exists
UPDATE employees 
SET role = ur.role::text
FROM user_roles ur 
WHERE employees.user_id = ur.user_id 
AND employees.role != ur.role::text;