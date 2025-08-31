-- Fix critical storage security policy - restrict document access
DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;

-- Create secure storage policies for documents bucket
CREATE POLICY "Employees can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Management can view all documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer', 'payroll')
  )
);

-- Fix role assignment function to be more secure
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(
  target_user_id uuid,
  new_role app_role,
  requester_manager_id text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_roles app_role[];
  target_employee record;
  manager_record record;
BEGIN
  -- Get requester's roles
  SELECT array_agg(role) INTO requester_roles
  FROM user_roles 
  WHERE user_id = auth.uid();
  
  -- Check if requester has permission to assign roles
  IF NOT (requester_roles && ARRAY['admin'::app_role, 'hr'::app_role]) THEN
    -- For employer role, additional validation
    IF 'employer'::app_role = ANY(requester_roles) THEN
      -- Employers can only assign employee/manager roles, not admin/hr/payroll
      IF new_role IN ('admin', 'hr', 'payroll') THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
      END IF;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
    END IF;
  END IF;
  
  -- Rate limiting check
  IF EXISTS (
    SELECT 1 FROM data_processing_log 
    WHERE processor_id = auth.uid() 
    AND action_type = 'role_assignment' 
    AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY processor_id 
    HAVING COUNT(*) >= 10
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded');
  END IF;
  
  -- Validate manager ID if provided for employee roles
  IF new_role = 'employee' AND requester_manager_id IS NOT NULL THEN
    SELECT * INTO manager_record
    FROM employees e
    JOIN user_roles ur ON ur.user_id = e.user_id
    WHERE e.manager_id = requester_manager_id 
    AND ur.role IN ('admin', 'employer', 'hr', 'manager');
    
    IF manager_record.id IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Invalid manager ID');
    END IF;
  END IF;
  
  -- Insert or update role
  INSERT INTO user_roles (user_id, role) 
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the assignment
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, 
    processed_data, processor_id
  ) VALUES (
    target_user_id, 'role_assignment', 'user_roles', 'legitimate_interests',
    json_build_object('role', new_role, 'assigned_by', auth.uid()),
    auth.uid()
  );
  
  RETURN json_build_object('success', true, 'role', new_role);
END;
$$;

-- Update existing assign_user_role function to use the secure version
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id uuid,
  new_role app_role
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN assign_user_role_secure(target_user_id, new_role);
END;
$$;