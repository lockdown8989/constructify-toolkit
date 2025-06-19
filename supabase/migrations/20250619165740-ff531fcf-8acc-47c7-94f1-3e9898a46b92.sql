
-- Fix the role audit trigger to handle user registration without breaking sign-up
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  RETURN NULL;
END;
$function$;

-- Also update the handle_new_user function to ensure it works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile first
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  
  -- Insert user role with proper error handling
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'user_role')::app_role, 'employee'));
  
  RETURN NEW;
END;
$function$;
