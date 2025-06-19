
-- Check the current authentication status of the user
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data,
  encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email = 'd0bl3@abv.bg';

-- Check if there are any auth events or issues
SELECT 
  event_type,
  email,
  created_at
FROM auth_events 
WHERE email = 'd0bl3@abv.bg'
ORDER BY created_at DESC
LIMIT 5;

-- If the user exists but can't log in, we may need to reset their password
-- First, let's ensure their email is confirmed
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"user_role": "manager", "email_confirmed": true}'::jsonb
WHERE email = 'd0bl3@abv.bg';

-- Verify the user's current state after update
SELECT 
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  created_at
FROM auth.users 
WHERE email = 'd0bl3@abv.bg';
