-- Add unique index on employees.manager_id to ensure no duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_manager_id_unique ON employees(manager_id) WHERE manager_id IS NOT NULL;

-- Create function to generate unique Manager ID
CREATE OR REPLACE FUNCTION public.generate_manager_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_id text;
  counter integer := 0;
BEGIN
  LOOP
    -- Generate a new manager ID with format MGR-XXXXX
    new_id := 'MGR-' || LPAD(FLOOR(RANDOM() * 99999 + 1)::text, 5, '0');
    
    -- Check if this ID already exists
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM employees WHERE manager_id = new_id
    );
    
    -- Safety counter to prevent infinite loops
    counter := counter + 1;
    IF counter > 1000 THEN
      RAISE EXCEPTION 'Unable to generate unique manager ID after 1000 attempts';
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Create RPC function to get or create manager ID for current user
CREATE OR REPLACE FUNCTION public.get_or_create_manager_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_id text;
  new_id text;
  user_role app_role;
BEGIN
  -- Check if user has manager/employer role
  SELECT role INTO user_role
  FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('employer', 'admin', 'hr', 'manager')
  LIMIT 1;
  
  IF user_role IS NULL THEN
    RAISE EXCEPTION 'User does not have manager privileges';
  END IF;
  
  -- Get existing manager ID
  SELECT manager_id INTO existing_id
  FROM employees 
  WHERE user_id = auth.uid() 
  AND manager_id IS NOT NULL;
  
  -- If exists, return it
  IF existing_id IS NOT NULL THEN
    RETURN existing_id;
  END IF;
  
  -- Generate new ID
  new_id := generate_manager_id();
  
  -- Update or insert employee record with new manager ID
  INSERT INTO employees (user_id, manager_id, name, job_title, department, site, salary)
  VALUES (
    auth.uid(), 
    new_id,
    COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = auth.uid()), 'Manager'),
    'Manager',
    'Management',
    'Main',
    0
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    manager_id = new_id,
    updated_at = now()
  WHERE employees.manager_id IS NULL;
  
  RETURN new_id;
END;
$$;

-- Create trigger to auto-populate manager_id for managers
CREATE OR REPLACE FUNCTION public.auto_assign_manager_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Only process if manager_id is null and we have a user_id
  IF NEW.manager_id IS NOT NULL OR NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if user has manager role
  SELECT role INTO user_role
  FROM user_roles 
  WHERE user_id = NEW.user_id 
  AND role IN ('employer', 'admin', 'hr', 'manager')
  LIMIT 1;
  
  -- If user has manager role, assign manager ID
  IF user_role IS NOT NULL THEN
    NEW.manager_id := generate_manager_id();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_assign_manager_id ON employees;
CREATE TRIGGER trigger_auto_assign_manager_id
  BEFORE INSERT OR UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_manager_id();