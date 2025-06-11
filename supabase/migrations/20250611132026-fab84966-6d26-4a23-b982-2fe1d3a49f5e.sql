
-- First, add a unique constraint on user_id in the employees table
ALTER TABLE public.employees ADD CONSTRAINT unique_employees_user_id UNIQUE (user_id);

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON public.payroll(employee_id);

-- Create a function to synchronize payroll users with employee data
CREATE OR REPLACE FUNCTION sync_payroll_user_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update employees table to ensure payroll users have employee records
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
    COALESCE(p.first_name || ' ' || p.last_name, 'Payroll User'),
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
  LEFT JOIN profiles p ON p.id = ur.user_id
  LEFT JOIN employees e ON e.user_id = ur.user_id
  WHERE ur.role = 'payroll'
  AND e.id IS NULL
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'payroll',
    job_title = 'Payroll Administrator',
    department = 'Finance';

  -- Ensure payroll users have proper employee records with correct role
  UPDATE employees 
  SET role = 'payroll',
      job_title = COALESCE(NULLIF(job_title, ''), 'Payroll Administrator'),
      department = COALESCE(NULLIF(department, ''), 'Finance')
  WHERE user_id IN (
    SELECT user_id FROM user_roles WHERE role = 'payroll'
  );

  -- Create salary_statistics records for payroll users if they don't exist
  -- Note: net_salary is excluded as it's a generated column
  INSERT INTO salary_statistics (
    employee_id,
    month,
    base_salary,
    payment_status
  )
  SELECT 
    e.id,
    date_trunc('month', CURRENT_DATE)::date,
    0,
    'N/A'
  FROM employees e
  JOIN user_roles ur ON ur.user_id = e.user_id
  LEFT JOIN salary_statistics ss ON ss.employee_id = e.id 
    AND ss.month = date_trunc('month', CURRENT_DATE)::date
  WHERE ur.role = 'payroll'
  AND ss.id IS NULL;

END;
$$;

-- Run the synchronization function
SELECT sync_payroll_user_data();

-- Create a trigger to automatically sync new payroll users
CREATE OR REPLACE FUNCTION auto_sync_payroll_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If a payroll role is assigned, ensure employee record exists
  IF NEW.role = 'payroll' THEN
    INSERT INTO employees (
      user_id,
      name,
      job_title,
      department,
      site,
      salary,
      role,
      status,
      lifecycle
    )
    SELECT 
      NEW.user_id,
      COALESCE(p.first_name || ' ' || p.last_name, 'Payroll User'),
      'Payroll Administrator',
      'Finance',
      'Head Office',
      0,
      'payroll',
      'Active',
      'Active'
    FROM profiles p
    WHERE p.id = NEW.user_id
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'payroll',
      job_title = 'Payroll Administrator',
      department = 'Finance';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic synchronization
DROP TRIGGER IF EXISTS trigger_auto_sync_payroll_user ON user_roles;
CREATE TRIGGER trigger_auto_sync_payroll_user
  AFTER INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION auto_sync_payroll_user();

-- Update RLS policies to ensure payroll users can access necessary data
DROP POLICY IF EXISTS "Payroll users can view all employee data" ON employees;
CREATE POLICY "Payroll users can view all employee data"
ON employees
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'payroll'
  )
);

DROP POLICY IF EXISTS "Payroll users can view all salary statistics" ON salary_statistics;
CREATE POLICY "Payroll users can view all salary statistics"
ON salary_statistics
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'payroll'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'payroll'
  )
);

DROP POLICY IF EXISTS "Payroll users can manage all payroll records" ON payroll;
CREATE POLICY "Payroll users can manage all payroll records"
ON payroll
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'payroll'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'payroll'
  )
);
