-- Clean up duplicate manager IDs and ensure uniqueness
-- First, identify and update duplicate manager IDs
WITH duplicate_mgr_ids AS (
  SELECT manager_id
  FROM employees 
  WHERE manager_id IS NOT NULL 
  GROUP BY manager_id 
  HAVING COUNT(*) > 1
),
employees_to_update AS (
  SELECT e.id, e.manager_id, 
         ROW_NUMBER() OVER (PARTITION BY e.manager_id ORDER BY e.id) as rn
  FROM employees e
  INNER JOIN duplicate_mgr_ids d ON e.manager_id = d.manager_id
)
UPDATE employees 
SET manager_id = 'MGR-' || LPAD((FLOOR(RANDOM() * 90000 + 10000))::int::text, 5, '0')
FROM employees_to_update etu
WHERE employees.id = etu.id AND etu.rn > 1;

-- Now add the unique constraint
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