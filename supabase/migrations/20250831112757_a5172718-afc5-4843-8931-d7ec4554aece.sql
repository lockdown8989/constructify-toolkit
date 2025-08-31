-- Fix security linter warnings - correct order of dropping dependencies

-- Drop trigger first, then function
DROP TRIGGER IF EXISTS enforce_employee_self_update_restrictions ON public.employees;
DROP FUNCTION IF EXISTS public.validate_employee_self_update();

-- Drop the view if it exists
DROP VIEW IF EXISTS public.employee_directory;

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