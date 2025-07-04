
-- Fix the security issue by setting a secure search_path for the sync_employee_email function
CREATE OR REPLACE FUNCTION public.sync_employee_email()
RETURNS TRIGGER AS $$
BEGIN
    -- When user_id is updated, sync the email from auth.users
    IF NEW.user_id IS NOT NULL AND (NEW.email IS NULL OR NEW.email = '') THEN
        SELECT email INTO NEW.email 
        FROM auth.users 
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;
