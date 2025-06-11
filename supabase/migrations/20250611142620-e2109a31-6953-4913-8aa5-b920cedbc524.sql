
-- First, let's run the synchronization function to ensure payroll users have proper data access
SELECT sync_payroll_user_data();

-- Update RLS policies to ensure payroll users can access all employee data
DROP POLICY IF EXISTS "Employees can view own data" ON employees;
DROP POLICY IF EXISTS "Managers can view employee data" ON employees;
DROP POLICY IF EXISTS "Payroll users can view all employee data" ON employees;

-- Create comprehensive RLS policies for employees table
CREATE POLICY "Employees can view own data" 
ON employees 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Managers can view employee data" 
ON employees 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('employer', 'admin', 'hr')
  )
);

CREATE POLICY "Payroll users can view all employee data" 
ON employees 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'payroll'
  )
);

-- Also ensure payroll users can manage employee data if needed
CREATE POLICY "Payroll users can update employee data" 
ON employees 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'payroll'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'payroll'
  )
);

-- Ensure the isPayroll role detection works properly by checking user roles
UPDATE user_roles 
SET role = 'payroll' 
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = 'vicky.stefanova@example.com' -- Adjust email as needed
);

-- Force sync for all payroll users to ensure they have employee records
INSERT INTO employees (
  user_id,
  name,
  job_title,
  department,
  site,
  salary,
  role,
  email,
  status,
  lifecycle
)
SELECT 
  ur.user_id,
  'Vicky Stefanova',
  'Payroll Administrator',
  'Finance',
  'Head Office',
  0,
  'payroll',
  au.email,
  'Active',
  'Active'
FROM user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE ur.role = 'payroll'
AND NOT EXISTS (
  SELECT 1 FROM employees e WHERE e.user_id = ur.user_id
);
