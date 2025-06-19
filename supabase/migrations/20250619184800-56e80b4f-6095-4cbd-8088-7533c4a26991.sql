
-- First, let's check if the user exists in auth.users and what their status is
SELECT 
  id, 
  email, 
  email_confirmed_at, 
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'd0bl3@abv.bg';

-- Check if there are any existing user_roles for this email
SELECT ur.*, au.email
FROM user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE au.email = 'd0bl3@abv.bg';

-- Check employee record
SELECT id, user_id, name, email, role, job_title
FROM employees 
WHERE email = 'd0bl3@abv.bg';

-- If the user exists but email is not confirmed, let's confirm it
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'd0bl3@abv.bg' 
AND email_confirmed_at IS NULL;

-- Make sure the user has proper metadata for manager role
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"user_role": "manager"}'::jsonb
WHERE email = 'd0bl3@abv.bg';
