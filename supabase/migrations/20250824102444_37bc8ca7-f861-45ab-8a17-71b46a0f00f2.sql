-- Update the app_role enum to replace 'employer' with 'admin'
-- Since we can't directly modify enum values, we need to create a new enum and update tables

-- Create new enum with admin instead of employer  
CREATE TYPE app_role_new AS ENUM ('admin', 'hr', 'employee', 'payroll');

-- Update user_roles table to use new enum
ALTER TABLE user_roles 
  ALTER COLUMN role TYPE app_role_new 
  USING CASE 
    WHEN role = 'employer' THEN 'admin'::app_role_new
    ELSE role::text::app_role_new
  END;

-- Drop old enum and rename new one
DROP TYPE app_role;
ALTER TYPE app_role_new RENAME TO app_role;

-- Update the get_user_primary_role function to reflect the change
CREATE OR REPLACE FUNCTION public.get_user_primary_role(p_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role
  FROM user_roles
  WHERE user_id = p_user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1     -- Updated from 'employer' to 'admin'
      WHEN 'hr' THEN 2  
      WHEN 'payroll' THEN 3   -- Moved up since no more employer
      WHEN 'employee' THEN 4  -- Moved up
    END
  LIMIT 1;
$function$;

-- Update has_role function to work with admin instead of employer
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = CASE 
        WHEN _role = 'employer' THEN 'admin'::app_role  -- Map old employer calls to admin
        WHEN _role = 'manager' THEN 'admin'::app_role   -- Map manager calls to admin  
        ELSE _role::app_role
      END
  )
$function$;