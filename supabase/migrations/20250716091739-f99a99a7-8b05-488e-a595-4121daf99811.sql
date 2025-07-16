-- Update passwords for nataliqqqq_@abv.bg and cupra300c@gmail.com users
UPDATE auth.users 
SET encrypted_password = crypt('dawedawe12', gen_salt('bf')),
    updated_at = NOW()
WHERE email IN ('nataliqqqq_@abv.bg', 'cupra300c@gmail.com');