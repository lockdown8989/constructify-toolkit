-- Clean up admin@hrapp.com user to have only admin role
-- Remove conflicting employee and employer roles for admin user
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@hrapp.com')
  AND role IN ('employee', 'employer');

-- Create a function to get user's highest priority role
CREATE OR REPLACE FUNCTION get_user_primary_role(p_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM user_roles
  WHERE user_id = p_user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'hr' THEN 2  
      WHEN 'employer' THEN 3  -- This is "manager" in the UI
      WHEN 'payroll' THEN 4
      WHEN 'employee' THEN 5
    END
  LIMIT 1;
$$;