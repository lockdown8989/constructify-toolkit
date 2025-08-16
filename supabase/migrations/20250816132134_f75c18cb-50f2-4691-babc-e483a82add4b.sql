-- Ensure unique manager IDs and improve generation
-- First, add a unique constraint on manager_id in employees table
ALTER TABLE employees ADD CONSTRAINT unique_manager_id UNIQUE (manager_id);

-- Update the generate_mgr_code function to ensure uniqueness
CREATE OR REPLACE FUNCTION generate_mgr_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code text;
  code_exists boolean := true;
  attempt_count integer := 0;
  max_attempts integer := 100;
BEGIN
  WHILE code_exists AND attempt_count < max_attempts LOOP
    -- Generate a new code
    new_code := 'MGR-' || LPAD((FLOOR(RANDOM() * 90000 + 10000))::int::text, 5, '0');
    
    -- Check if this code already exists
    SELECT EXISTS (
      SELECT 1 FROM employees WHERE manager_id = new_code
    ) INTO code_exists;
    
    attempt_count := attempt_count + 1;
  END LOOP;
  
  -- If we couldn't generate a unique code after max attempts, raise an exception
  IF code_exists THEN
    RAISE EXCEPTION 'Unable to generate unique manager ID after % attempts', max_attempts;
  END IF;
  
  RETURN new_code;
END;
$$;

-- Create an index on manager_id for better performance
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id) WHERE manager_id IS NOT NULL;