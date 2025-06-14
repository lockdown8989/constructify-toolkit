
-- Ensure payroll users can update all employee data including salaries
DROP POLICY IF EXISTS "Payroll users can update employee data" ON employees;

CREATE POLICY "Payroll users can update all employee data" 
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

-- Also ensure payroll users can insert new employee records if needed
CREATE POLICY "Payroll users can insert employee data" 
ON employees 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'payroll'
  )
);

-- Make sure payroll users can access salary_statistics
DROP POLICY IF EXISTS "Payroll users can view all salary data" ON salary_statistics;
DROP POLICY IF EXISTS "Payroll users can update salary data" ON salary_statistics;
DROP POLICY IF EXISTS "Payroll users can insert salary data" ON salary_statistics;

CREATE POLICY "Payroll users can view all salary data" 
ON salary_statistics 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'payroll'
  )
);

CREATE POLICY "Payroll users can update salary data" 
ON salary_statistics 
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

CREATE POLICY "Payroll users can insert salary data" 
ON salary_statistics 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'payroll'
  )
);
