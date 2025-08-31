-- Fix security linter warnings created by the previous migration

-- 1. Fix the security definer view issue by removing it and creating proper RLS policies instead
DROP VIEW IF EXISTS public.employee_directory;

-- 2. Fix the function search path issue by adding proper security settings
DROP FUNCTION IF EXISTS public.validate_employee_self_update();
DROP TRIGGER IF EXISTS enforce_employee_self_update_restrictions ON public.employees;

-- Create a more secure function with proper search path
CREATE OR REPLACE FUNCTION public.validate_employee_self_update()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the user is updating their own record (not admin/hr/manager)
  IF NEW.user_id = auth.uid() AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin'::app_role, 'hr'::app_role, 'employer'::app_role, 'manager'::app_role)
  ) THEN
    -- Prevent employees from changing sensitive fields
    NEW.salary := OLD.salary;
    NEW.hourly_rate := OLD.hourly_rate;
    NEW.role := OLD.role;
    NEW.manager_id := OLD.manager_id;
    NEW.status := OLD.status;
    NEW.lifecycle := OLD.lifecycle;
    NEW.user_id := OLD.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER enforce_employee_self_update_restrictions
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_employee_self_update();

-- Instead of a security definer view, create a regular table for employee directory
-- that gets populated by a function (more secure approach)
CREATE TABLE IF NOT EXISTS public.employee_directory_safe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the directory table
ALTER TABLE public.employee_directory_safe ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the directory - only show active employees
CREATE POLICY "authenticated_users_can_view_active_employees_directory" 
ON public.employee_directory_safe FOR SELECT 
USING (
  auth.role() = 'authenticated' AND status = 'Active'
);

-- Create function to refresh the directory data
CREATE OR REPLACE FUNCTION public.refresh_employee_directory()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear existing data
  TRUNCATE TABLE public.employee_directory_safe;
  
  -- Insert current active employee data (non-sensitive fields only)
  INSERT INTO public.employee_directory_safe (
    employee_id, name, job_title, department, email, avatar_url, status
  )
  SELECT 
    id, name, job_title, department, email, avatar_url, status
  FROM public.employees
  WHERE status = 'Active';
  
  -- Update timestamp
  UPDATE public.employee_directory_safe SET updated_at = NOW();
END;
$$;

-- Create trigger to automatically update directory when employee data changes
CREATE OR REPLACE FUNCTION public.update_employee_directory_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Refresh the entire directory to keep it current
  PERFORM public.refresh_employee_directory();
  RETURN NULL;
END;
$$;

-- Create triggers for directory updates
CREATE TRIGGER update_directory_on_employee_insert
  AFTER INSERT ON public.employees
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.update_employee_directory_on_change();

CREATE TRIGGER update_directory_on_employee_update
  AFTER UPDATE ON public.employees
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.update_employee_directory_on_change();

CREATE TRIGGER update_directory_on_employee_delete
  AFTER DELETE ON public.employees
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.update_employee_directory_on_change();

-- Initial population of the directory
SELECT public.refresh_employee_directory();