-- Fix missing subscription trial columns
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS subscription_is_trial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_trial_end TIMESTAMPTZ;

-- Add unique index for administrator IDs to prevent collisions
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_manager_id_unique ON public.employees (manager_id) WHERE manager_id IS NOT NULL;

-- Create RPC function to generate unique Administrator IDs
CREATE OR REPLACE FUNCTION public.generate_admin_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_id TEXT;
  counter INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  LOOP
    -- Generate ADM-#### format (4 digits, zero-padded)
    new_id := 'ADM-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if this ID already exists
    IF NOT EXISTS (SELECT 1 FROM employees WHERE manager_id = new_id) THEN
      RETURN new_id;
    END IF;
    
    counter := counter + 1;
    IF counter >= max_attempts THEN
      -- Fallback to timestamp-based ID if we can't find a unique random one
      new_id := 'ADM-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Create RPC function to validate Administrator ID format
CREATE OR REPLACE FUNCTION public.validate_admin_id(p_admin_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Accept both ADM-#### and MGR-#### formats for backward compatibility
  IF p_admin_id ~ '^(ADM|MGR)-[0-9]{4}$' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Refine user_presence RLS policies for better security
DROP POLICY IF EXISTS "Users can view non-hidden presence data" ON user_presence;

-- More restrictive policy: users can only see presence of colleagues in same department/site
CREATE POLICY "Users can view colleague presence data" 
ON user_presence 
FOR SELECT 
TO authenticated 
USING (
  hide_online_status = false 
  AND user_id != auth.uid() -- Don't show self through this policy
  AND EXISTS (
    SELECT 1 
    FROM employees e1 
    JOIN employees e2 ON (
      (e1.department = e2.department AND e1.department IS NOT NULL) 
      OR (e1.site = e2.site AND e1.site IS NOT NULL)
    )
    WHERE e1.user_id = auth.uid() 
    AND e2.user_id = user_presence.user_id
  )
);

-- Add indexes for better performance on presence queries
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence (user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_is_online ON user_presence (is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_employees_dept_site ON employees (department, site) WHERE department IS NOT NULL OR site IS NOT NULL;