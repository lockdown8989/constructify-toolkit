-- Update password for thrivolve0@gmail.com user
UPDATE auth.users 
SET encrypted_password = crypt('dawedawe88', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'thrivolve0@gmail.com';