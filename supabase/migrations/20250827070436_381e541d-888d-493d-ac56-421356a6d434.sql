-- CRITICAL SECURITY FIXES - PART 3: REBUILD CLEAN ATTENDANCE POLICIES

-- Create clean, consistent attendance policies
CREATE POLICY "Employees can view their own attendance" ON public.attendance
FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Employees can create their own attendance" ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Employees can update their own attendance" ON public.attendance
FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Management can view all attendance" ON public.attendance
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = ANY(ARRAY['admin'::app_role, 'employer'::app_role, 'hr'::app_role, 'payroll'::app_role])
  )
);

CREATE POLICY "Management can manage all attendance" ON public.attendance
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = ANY(ARRAY['admin'::app_role, 'employer'::app_role, 'hr'::app_role])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = ANY(ARRAY['admin'::app_role, 'employer'::app_role, 'hr'::app_role])
  )
);

-- Add security audit logging
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, details jsonb DEFAULT '{}')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, processed_data
  ) VALUES (
    auth.uid(), 'security_event', 'system', 'security_monitoring',
    jsonb_build_object(
      'event_type', event_type,
      'details', details,
      'timestamp', NOW(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  );
END;
$$;