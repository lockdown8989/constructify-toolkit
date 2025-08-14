-- Fix RLS policies to allow user registration while maintaining security

-- 1. Fix user_roles table policies
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can insert user roles" ON public.user_roles;

-- Allow users to insert their own initial role during signup
CREATE POLICY "Users can insert their initial role during signup" ON public.user_roles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Only allow admins to update/delete roles after initial creation
CREATE POLICY "Only admins can modify existing roles" ON public.user_roles
  FOR UPDATE 
  TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles" ON public.user_roles
  FOR DELETE 
  TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Clean up duplicate/conflicting employees policies
DROP POLICY IF EXISTS "Allow authenticated users to delete employees" ON public.employees;
DROP POLICY IF EXISTS "Allow authenticated users to insert employees" ON public.employees;
DROP POLICY IF EXISTS "Allow authenticated users to update employees" ON public.employees;
DROP POLICY IF EXISTS "Allow authenticated users to view employees" ON public.employees;
DROP POLICY IF EXISTS "Employees can only see their own records" ON public.employees;
DROP POLICY IF EXISTS "Allow managers to manage employees" ON public.employees;

-- Create clean, non-conflicting policies for employees
CREATE POLICY "Users can create their own employee record during signup" ON public.employees
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own employee record" ON public.employees
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own employee record" ON public.employees
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Management roles can view/manage all employees
CREATE POLICY "Management can view all employees" ON public.employees
  FOR SELECT 
  TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role) OR 
         has_role(auth.uid(), 'employer'::app_role) OR 
         has_role(auth.uid(), 'hr'::app_role) OR 
         has_role(auth.uid(), 'manager'::app_role) OR 
         has_role(auth.uid(), 'payroll'::app_role));

CREATE POLICY "Management can modify all employees" ON public.employees
  FOR UPDATE 
  TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role) OR 
         has_role(auth.uid(), 'employer'::app_role) OR 
         has_role(auth.uid(), 'hr'::app_role) OR 
         has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete employees" ON public.employees
  FOR DELETE 
  TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix profiles table - add INSERT policy for user registration
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

-- Clean policies for profiles
CREATE POLICY "Users can create their own profile during signup" ON public.profiles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Admins can view all profiles for management purposes
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Create function to handle user registration (if needed)
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();