-- Create a test manager account for easy login
-- First, let's create a test user in the auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Test", "last_name": "User"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('password123', gen_salt('bf')),
  updated_at = now();