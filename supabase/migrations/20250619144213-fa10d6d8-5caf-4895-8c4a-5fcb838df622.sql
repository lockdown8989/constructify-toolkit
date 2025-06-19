
-- CRITICAL SECURITY FIX: Emergency RLS Policy Cleanup and Security Hardening (CORRECTED)
-- Phase 1: Remove dangerous policies and consolidate conflicting ones

-- 1. CRITICAL: Remove ALL existing policies on user_roles table first
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON user_roles;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Admin only role management" ON user_roles;

-- 2. Create secure admin-only role management policies for user_roles table
CREATE POLICY "Only admins can manage user roles"
ON user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Allow users to view their own roles only
CREATE POLICY "Users can view their own roles"
ON user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Clean up conflicting policies on employees table
DROP POLICY IF EXISTS "Allow authenticated users to view employees" ON employees;
DROP POLICY IF EXISTS "Allow managers to manage employees" ON employees;
DROP POLICY IF EXISTS "Employees can view own data" ON employees;
DROP POLICY IF EXISTS "Managers can view employee data" ON employees;
DROP POLICY IF EXISTS "Payroll users can view all employee data" ON employees;
DROP POLICY IF EXISTS "Payroll users can update employee data" ON employees;
DROP POLICY IF EXISTS "Employees secure access policy" ON employees;
DROP POLICY IF EXISTS "Admin and HR can manage employees" ON employees;

-- Create consolidated, secure policies for employees table
CREATE POLICY "Employees secure access policy"
ON employees
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR -- Users can see their own employee record
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer', 'payroll')
  )
);

CREATE POLICY "Admin and HR can manage employees"
ON employees
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer')
  )
);

-- 4. Add missing RLS policies for sensitive tables

-- Secure auth_events table
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can access auth events" ON auth_events;
CREATE POLICY "Only admins can access auth events"
ON auth_events
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Secure employee_composition table
ALTER TABLE employee_composition ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "HR and admins can access employee composition" ON employee_composition;
CREATE POLICY "HR and admins can access employee composition"
ON employee_composition
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer')
  )
);

-- Secure hiring_statistics table
ALTER TABLE hiring_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "HR and admins can access hiring statistics" ON hiring_statistics;
CREATE POLICY "HR and admins can access hiring statistics"
ON hiring_statistics
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer')
  )
);

-- Secure labor_analytics table
ALTER TABLE labor_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Managers and admins can access labor analytics" ON labor_analytics;
CREATE POLICY "Managers and admins can access labor analytics"
ON labor_analytics
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer', 'payroll')
  )
);

-- 5. Clean up conflicting attendance policies
DROP POLICY IF EXISTS "Users can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Managers can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Users can insert own attendance" ON attendance;
DROP POLICY IF EXISTS "Managers can manage attendance" ON attendance;
DROP POLICY IF EXISTS "Attendance secure access policy" ON attendance;
DROP POLICY IF EXISTS "Attendance secure modification policy" ON attendance;

-- Create secure attendance policies
CREATE POLICY "Attendance secure access policy"
ON attendance
FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer', 'payroll')
  )
);

CREATE POLICY "Attendance secure modification policy"
ON attendance
FOR ALL
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer')
  )
)
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr', 'employer')
  )
);

-- 6. Add audit logging for role changes (only if not exists)
CREATE TABLE IF NOT EXISTS role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_user_id UUID NOT NULL,
  old_role TEXT,
  new_role TEXT NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT
);

ALTER TABLE role_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view audit logs" ON role_audit_log;
CREATE POLICY "Only admins can view audit logs"
ON role_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Create trigger function for role audit logging
CREATE OR REPLACE FUNCTION log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO role_audit_log (changed_user_id, new_role, changed_by, reason)
    VALUES (NEW.user_id, NEW.role::text, auth.uid(), 'Role assigned');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO role_audit_log (changed_user_id, old_role, new_role, changed_by, reason)
    VALUES (NEW.user_id, OLD.role::text, NEW.role::text, auth.uid(), 'Role updated');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO role_audit_log (changed_user_id, old_role, new_role, changed_by, reason)
    VALUES (OLD.user_id, OLD.role::text, 'removed', auth.uid(), 'Role removed');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for role audit logging
DROP TRIGGER IF EXISTS role_changes_audit_trigger ON user_roles;
CREATE TRIGGER role_changes_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_changes();
