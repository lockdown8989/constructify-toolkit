
-- Fix the user registration triggers and functions to handle profile creation properly

-- First, let's recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with error handling
  BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''), 
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Insert user role with error handling
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id, 
      CASE 
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 'employer'::app_role
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'admin' THEN 'admin'::app_role
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'hr' THEN 'hr'::app_role
        WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 'payroll'::app_role
        ELSE 'employee'::app_role
      END
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create user role for user %: %', NEW.id, SQLERRM;
      -- Try to insert a default employee role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'employee'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
  END;
  
  -- Create employee record if needed with error handling
  IF (NEW.raw_user_meta_data->>'user_role') IN ('manager', 'employee', 'payroll') THEN
    BEGIN
      INSERT INTO public.employees (
        user_id,
        name,
        job_title,
        department,
        site,
        salary,
        role,
        email,
        status,
        lifecycle,
        manager_id
      ) VALUES (
        NEW.id,
        COALESCE(
          TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')),
          'New User'
        ),
        CASE 
          WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 'Manager'
          WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 'Payroll Administrator'
          ELSE 'Employee'
        END,
        CASE 
          WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 'Finance'
          ELSE 'General'
        END,
        'Head Office',
        CASE 
          WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 55000
          WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 45000
          ELSE 35000
        END,
        CASE 
          WHEN (NEW.raw_user_meta_data->>'user_role') = 'manager' THEN 'employer'
          WHEN (NEW.raw_user_meta_data->>'user_role') = 'payroll' THEN 'payroll'
          ELSE 'employee'
        END,
        NEW.email,
        'Active',
        'Active',
        NEW.raw_user_meta_data->>'manager_id'
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create employee record for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the role audit function to be more robust
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO role_audit_log (changed_user_id, new_role, changed_by, reason)
      VALUES (NEW.user_id, NEW.role::text, COALESCE(auth.uid(), NEW.user_id), 'Role assigned');
      RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
      INSERT INTO role_audit_log (changed_user_id, old_role, new_role, changed_by, reason)
      VALUES (NEW.user_id, OLD.role::text, NEW.role::text, COALESCE(auth.uid(), NEW.user_id), 'Role updated');
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO role_audit_log (changed_user_id, old_role, new_role, changed_by, reason)
      VALUES (OLD.user_id, OLD.role::text, 'removed', COALESCE(auth.uid(), OLD.user_id), 'Role removed');
      RETURN OLD;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the operation
      RAISE WARNING 'Failed to log role change: %', SQLERRM;
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
  END;
  
  RETURN NULL;
END;
$function$;

-- Ensure proper constraints on the profiles table
ALTER TABLE public.profiles ALTER COLUMN id SET NOT NULL;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- Add foreign key constraint to ensure referential integrity
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure user_roles table has proper constraints
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
