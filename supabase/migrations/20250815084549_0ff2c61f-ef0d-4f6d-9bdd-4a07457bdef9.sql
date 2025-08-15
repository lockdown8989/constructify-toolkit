-- Delete test users from auth.users table
DELETE FROM auth.users WHERE email IN ('test@admin.com', 'test@example.com');