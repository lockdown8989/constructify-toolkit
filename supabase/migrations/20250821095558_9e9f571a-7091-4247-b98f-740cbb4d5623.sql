
-- Create or update the validation function to ensure proper manager ID handling
CREATE OR REPLACE FUNCTION public.validate_manager_id_strict(p_manager_id text)
RETURNS TABLE(
  valid boolean,
  manager_name text,
  manager_user_id uuid,
  manager_role text,
  error text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if manager ID exists and get manager details
  RETURN QUERY
  SELECT 
    CASE 
      WHEN e.id IS NOT NULL THEN true 
      ELSE false 
    END as valid,
    e.name as manager_name,
    e.user_id as manager_user_id,
    COALESCE(e.job_title, 'Manager') as manager_role,
    CASE 
      WHEN e.id IS NULL THEN 'Manager ID not found'
      ELSE NULL
    END as error
  FROM employees e
  WHERE e.manager_id = p_manager_id
    AND e.user_id IS NOT NULL
  LIMIT 1;
  
  -- If no results found, return invalid result
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::uuid, NULL::text, 'Manager ID does not exist'::text;
  END IF;
END;
$$;

-- Create a function to get manager details by user ID
CREATE OR REPLACE FUNCTION public.get_manager_details(p_user_id uuid)
RETURNS TABLE(
  manager_id text,
  name text,
  job_title text,
  department text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.manager_id,
    e.name,
    e.job_title,
    e.department
  FROM employees e
  WHERE e.user_id = p_user_id
    AND e.manager_id IS NOT NULL
    AND e.manager_id != ''
  LIMIT 1;
END;
$$;

-- Update RLS policies for better manager visibility
DROP POLICY IF EXISTS "Managers can view their own details" ON employees;
CREATE POLICY "Managers can view their own details"
ON employees
FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'employer', 'hr', 'manager')
  )
);

-- Ensure managers can update their own records
DROP POLICY IF EXISTS "Managers can update own records" ON employees;
CREATE POLICY "Managers can update own records"
ON employees
FOR UPDATE
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'employer', 'hr', 'manager')
  )
);
