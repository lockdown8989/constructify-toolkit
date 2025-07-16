-- Update password for existing admin@hrapp.com user
UPDATE auth.users 
SET encrypted_password = crypt('admin123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'admin@hrapp.com';