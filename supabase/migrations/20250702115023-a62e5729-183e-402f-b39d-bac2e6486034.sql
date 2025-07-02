
-- Update employees table to ensure email field is properly set and synchronized
-- Add email field constraints and ensure it's properly indexed
ALTER TABLE public.employees 
ADD CONSTRAINT employees_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create an index on email for better performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);

-- Update employees table to sync email from auth.users where missing
UPDATE public.employees 
SET email = auth_users.email 
FROM auth.users auth_users 
WHERE employees.user_id = auth_users.id 
AND (employees.email IS NULL OR employees.email = '');

-- Create a function to sync email from auth.users to employees
CREATE OR REPLACE FUNCTION sync_employee_email()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically sync email when employee record is updated
DROP TRIGGER IF EXISTS trigger_sync_employee_email ON public.employees;
CREATE TRIGGER trigger_sync_employee_email
    BEFORE INSERT OR UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION sync_employee_email();
