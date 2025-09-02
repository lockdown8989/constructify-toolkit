-- Fix manager-employee relationship synchronization
-- Create function to properly validate and sync manager IDs

CREATE OR REPLACE FUNCTION public.sync_manager_employee_relationships()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emp_record record;
  manager_record record;
BEGIN
  -- Loop through all employees with manager_id set
  FOR emp_record IN
    SELECT id, user_id, name, manager_id, role
    FROM employees 
    WHERE manager_id IS NOT NULL AND manager_id != ''
  LOOP
    -- Find the manager employee record by manager_id
    SELECT * INTO manager_record
    FROM employees
    WHERE manager_id = emp_record.manager_id
    AND role IN ('manager', 'employer', 'admin')
    LIMIT 1;
    
    IF manager_record.id IS NOT NULL THEN
      -- Valid manager found, log success
      RAISE NOTICE 'Employee % linked to manager % (ID: %)', 
        emp_record.name, manager_record.name, emp_record.manager_id;
    ELSE
      -- Invalid manager ID, log warning
      RAISE WARNING 'Employee % has invalid manager_id: %. No manager found with this ID.', 
        emp_record.name, emp_record.manager_id;
    END IF;
  END LOOP;
END;
$$;

-- Create function to generate unique manager IDs
CREATE OR REPLACE FUNCTION public.generate_unique_manager_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id text;
  id_exists boolean;
BEGIN
  LOOP
    -- Generate a new manager ID
    new_id := 'MGR-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::text, 5, '0');
    
    -- Check if this ID already exists
    SELECT EXISTS(
      SELECT 1 FROM employees WHERE manager_id = new_id
    ) INTO id_exists;
    
    -- If ID doesn't exist, we can use it
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Create function to validate manager ID format and existence
CREATE OR REPLACE FUNCTION public.validate_manager_id(p_manager_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  manager_record record;
  result json;
BEGIN
  -- Check format
  IF p_manager_id IS NULL OR p_manager_id = '' THEN
    RETURN json_build_object(
      'is_valid', false,
      'error', 'Manager ID is required',
      'manager_name', null
    );
  END IF;
  
  IF NOT p_manager_id ~ '^MGR-[0-9]{5}$' THEN
    RETURN json_build_object(
      'is_valid', false,
      'error', 'Invalid manager ID format. Should be MGR-XXXXX (5 digits)',
      'manager_name', null
    );
  END IF;
  
  -- Check if manager exists
  SELECT * INTO manager_record
  FROM employees
  WHERE manager_id = p_manager_id
  AND role IN ('manager', 'employer', 'admin')
  AND status = 'Active'
  LIMIT 1;
  
  IF manager_record.id IS NOT NULL THEN
    RETURN json_build_object(
      'is_valid', true,
      'error', null,
      'manager_name', manager_record.name,
      'manager_id', manager_record.id
    );
  ELSE
    RETURN json_build_object(
      'is_valid', false,
      'error', 'Manager not found or inactive. Please verify the manager ID.',
      'manager_name', null
    );
  END IF;
END;
$$;

-- Update the existing trigger to use the new validation
CREATE OR REPLACE FUNCTION public.validate_employee_manager_relationship()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  validation_result json;
BEGIN
  -- Only validate if manager_id is being set/changed for employees
  IF NEW.manager_id IS NOT NULL AND NEW.manager_id != '' AND NEW.role = 'employee' THEN
    SELECT public.validate_manager_id(NEW.manager_id) INTO validation_result;
    
    IF NOT (validation_result->>'is_valid')::boolean THEN
      RAISE WARNING 'Manager ID validation failed for employee %: %', 
        NEW.name, validation_result->>'error';
      -- Don't block the insert/update, just log the warning
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS validate_manager_relationship ON employees;
CREATE TRIGGER validate_manager_relationship
  BEFORE INSERT OR UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION validate_employee_manager_relationship();

-- Run the sync function to check current relationships
SELECT public.sync_manager_employee_relationships();