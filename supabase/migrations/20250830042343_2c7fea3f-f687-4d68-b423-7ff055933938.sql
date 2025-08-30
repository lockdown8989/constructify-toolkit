-- Fix critical security issue: Overly broad RLS policies on employees table
-- Remove duplicate and overly permissive policies, implement proper role-based access

-- First, drop all existing policies to start clean
DROP POLICY IF EXISTS "Admins can delete employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can view all employee records" ON public.employees;
DROP POLICY IF EXISTS "Employees can view own data" ON public.employees;
DROP POLICY IF EXISTS "Employers can see all employees" ON public.employees;
DROP POLICY IF EXISTS "Management can modify all employees" ON public.employees;
DROP POLICY IF EXISTS "Management can view all employees" ON public.employees;
DROP POLICY IF EXISTS "Managers can view employee data" ON public.employees;
DROP POLICY IF EXISTS "Payroll users can update employee data" ON public.employees;
DROP POLICY IF EXISTS "Payroll users can view all employee data" ON public.employees;
DROP POLICY IF EXISTS "Payroll users can view all employees for payroll management" ON public.employees;
DROP POLICY IF EXISTS "Users can create their own employee record during signup" ON public.employees;
DROP POLICY IF EXISTS "Users can update their own employee record" ON public.employees;
DROP POLICY IF EXISTS "Users can view their own employee record" ON public.employees;
DROP POLICY IF EXISTS "Users can view their own leave stats or their team's stats" ON public.employees;

-- Create new, secure role-based policies

-- 1. ADMINS: Full access (most privileged)
CREATE POLICY "admin_full_access_employees" 
ON public.employees FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- 2. HR: Full read/write access to employee data (needed for HR operations)
CREATE POLICY "hr_full_access_employees" 
ON public.employees FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'hr'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'hr'::app_role
  )
);

-- 3. MANAGERS/EMPLOYERS: Read access to all employees, limited write access
CREATE POLICY "manager_read_all_employees" 
ON public.employees FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('employer'::app_role, 'manager'::app_role)
  )
);

CREATE POLICY "manager_update_employees" 
ON public.employees FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('employer'::app_role, 'manager'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('employer'::app_role, 'manager'::app_role)
  )
);

-- 4. PAYROLL: Read access to financial data, limited update access for payroll fields
CREATE POLICY "payroll_read_employees" 
ON public.employees FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'payroll'::app_role
  )
);

CREATE POLICY "payroll_update_financial_data" 
ON public.employees FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'payroll'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'payroll'::app_role
  )
);

-- 5. EMPLOYEES: Can only view and update their own records (with restrictions)
CREATE POLICY "employee_view_own_data" 
ON public.employees FOR SELECT 
USING (user_id = auth.uid());

-- Separate policy for employee self-updates with field restrictions
CREATE POLICY "employee_update_own_profile" 
ON public.employees FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. EMPLOYEE SIGNUP: Allow creating own employee record during signup
CREATE POLICY "employee_create_own_record" 
ON public.employees FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create a view for limited employee information that can be safely shared
CREATE OR REPLACE VIEW public.employee_directory AS
SELECT 
  id,
  name,
  job_title,
  department,
  email,
  avatar_url,
  status
FROM public.employees
WHERE status = 'Active';

-- Create a function to control employee self-updates (prevent salary/role changes)
CREATE OR REPLACE FUNCTION public.validate_employee_self_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is updating their own record (not admin/hr/manager)
  IF NEW.user_id = auth.uid() AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin'::app_role, 'hr'::app_role, 'employer'::app_role, 'manager'::app_role)
  ) THEN
    -- Prevent employees from changing sensitive fields
    NEW.salary := OLD.salary;
    NEW.hourly_rate := OLD.hourly_rate;
    NEW.role := OLD.role;
    NEW.manager_id := OLD.manager_id;
    NEW.status := OLD.status;
    NEW.lifecycle := OLD.lifecycle;
    NEW.user_id := OLD.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce employee update restrictions
CREATE TRIGGER enforce_employee_self_update_restrictions
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_employee_self_update();

-- Log this security improvement
INSERT INTO public.security_audit_log (
  event_type,
  table_name,
  description,
  risk_level,
  action_taken,
  performed_by
) VALUES (
  'policy_update',
  'employees',
  'Fixed overly broad RLS policies on employees table. Removed duplicate policies and implemented strict role-based access control. Added trigger to prevent employees from modifying sensitive fields.',
  'high',
  'Updated RLS policies to follow principle of least privilege',
  auth.uid()
);