
-- Update the app_role enum to include the new role names
-- We need to add the new roles and update existing data

-- Add new roles to the enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'manager_administrator';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'payroll_administrator';

-- Update existing roles to new naming convention
UPDATE user_roles 
SET role = 'manager_administrator'::app_role 
WHERE role = 'employer'::app_role OR role = 'manager'::app_role;

UPDATE user_roles 
SET role = 'payroll_administrator'::app_role 
WHERE role = 'payroll'::app_role;

-- Update the has_role function to handle new roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  ) OR (
    -- Manager-Administrator has admin privileges
    _role = 'admin'::app_role AND EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = 'manager_administrator'::app_role
    )
  );
$$;

-- Update the get_user_primary_role function for new roles
CREATE OR REPLACE FUNCTION public.get_user_primary_role(p_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role
  FROM user_roles
  WHERE user_id = p_user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'manager_administrator' THEN 2
      WHEN 'hr' THEN 3
      WHEN 'payroll_administrator' THEN 4
      WHEN 'employee' THEN 5
    END
  LIMIT 1;
$$;

-- Update RLS policies to recognize manager_administrator as having admin privileges
-- This will automatically apply to all existing policies that check for 'admin' role
-- because our has_role function now treats manager_administrator as having admin privileges
