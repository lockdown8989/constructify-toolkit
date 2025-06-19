
-- Fix the infinite recursion in user_roles RLS policies
-- First, drop all existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow managers to manage user roles" ON public.user_roles;

-- Create a security definer function to safely check user roles without recursion
CREATE OR REPLACE FUNCTION public.get_user_role_safe(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role::text INTO user_role
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'employee');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'employee';
END;
$$;

-- Create a function to check if a user has a specific role
CREATE OR REPLACE FUNCTION public.user_has_role(p_user_id uuid, p_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = p_user_id 
    AND role::text = p_role
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Create simple, non-recursive RLS policies for user_roles
CREATE POLICY "Allow users to view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Allow users to insert their own roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow admins to manage all roles (using our safe function)
CREATE POLICY "Allow admins to manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.user_has_role(auth.uid(), 'admin')
);

-- Ensure RLS is enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Also fix any potential issues with employees table RLS
DROP POLICY IF EXISTS "Allow managers to manage employees" ON public.employees;
DROP POLICY IF EXISTS "Allow all authenticated users to view employees" ON public.employees;
DROP POLICY IF EXISTS "Allow authenticated users to view employees" ON public.employees;

-- Create safe policies for employees table
CREATE POLICY "Allow users to view employees"
ON public.employees
FOR SELECT
TO authenticated
USING (true); -- Allow all authenticated users to view employees

CREATE POLICY "Allow users to manage their own employee record"
ON public.employees
FOR ALL
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Allow admins to manage all employees"
ON public.employees
FOR ALL
TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow HR to manage all employees"
ON public.employees
FOR ALL
TO authenticated
USING (public.user_has_role(auth.uid(), 'hr'));

CREATE POLICY "Allow managers to manage all employees"
ON public.employees
FOR ALL
TO authenticated
USING (public.user_has_role(auth.uid(), 'employer'));

-- Ensure RLS is enabled on employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_role_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role(uuid, text) TO authenticated;
