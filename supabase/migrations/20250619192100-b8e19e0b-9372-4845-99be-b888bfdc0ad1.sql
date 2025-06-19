
-- Phase 1: Critical Infrastructure Fixes - Foreign Key Cascade Issues
-- Fix the shift_notifications table foreign key constraint that's preventing user deletion

-- First, drop the existing foreign key constraint
ALTER TABLE shift_notifications DROP CONSTRAINT IF EXISTS shift_notifications_employee_id_fkey;

-- Add a new foreign key constraint with CASCADE DELETE
ALTER TABLE shift_notifications ADD CONSTRAINT shift_notifications_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

-- Fix other problematic foreign key constraints
-- Update documents table
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;
ALTER TABLE documents ALTER COLUMN uploaded_by DROP NOT NULL;
ALTER TABLE documents ADD CONSTRAINT documents_uploaded_by_fkey 
    FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update other constraint issues from the migration that was cut off
ALTER TABLE documents ALTER COLUMN uploaded_by DROP NOT NULL;

-- Fix attendance table foreign keys
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_overtime_approved_by_fkey;
ALTER TABLE attendance ALTER COLUMN overtime_approved_by DROP NOT NULL;
ALTER TABLE attendance ADD CONSTRAINT attendance_overtime_approved_by_fkey 
    FOREIGN KEY (overtime_approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add NOT NULL constraints to security-critical user_id columns
ALTER TABLE profiles ALTER COLUMN id SET NOT NULL;
ALTER TABLE user_roles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE employees ALTER COLUMN user_id DROP NOT NULL; -- This can be null for non-user employees

-- Create consolidated RLS policies for key tables
-- First, clean up existing policies on attendance table (there are too many)
DROP POLICY IF EXISTS "attendance_delete_policy" ON attendance;
DROP POLICY IF EXISTS "attendance_insert_policy" ON attendance;
DROP POLICY IF EXISTS "attendance_select_policy" ON attendance;
DROP POLICY IF EXISTS "attendance_update_policy" ON attendance;

-- Create simplified, comprehensive RLS policies for attendance
CREATE POLICY "attendance_comprehensive_policy" ON attendance
FOR ALL TO authenticated
USING (
  -- Users can access their own attendance records
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  OR
  -- Managers, admins, and HR can access all records
  public.has_role(auth.uid(), 'employer')
  OR
  public.has_role(auth.uid(), 'admin') 
  OR
  public.has_role(auth.uid(), 'hr')
)
WITH CHECK (
  -- Users can only modify their own records
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  OR
  -- Managers, admins, and HR can modify all records
  public.has_role(auth.uid(), 'employer')
  OR
  public.has_role(auth.uid(), 'admin')
  OR
  public.has_role(auth.uid(), 'hr')
);

-- Ensure user_roles table has proper RLS
DROP POLICY IF EXISTS "user_roles_policy" ON user_roles;
CREATE POLICY "user_roles_comprehensive_policy" ON user_roles
FOR ALL TO authenticated
USING (
  -- Users can view their own roles
  user_id = auth.uid()
  OR
  -- Admins and HR can view all roles
  public.has_role(auth.uid(), 'admin')
  OR
  public.has_role(auth.uid(), 'hr')
)
WITH CHECK (
  -- Only admins can modify roles
  public.has_role(auth.uid(), 'admin')
);

-- Ensure employees table has proper RLS
DROP POLICY IF EXISTS "employees_policy" ON employees;
CREATE POLICY "employees_comprehensive_policy" ON employees
FOR ALL TO authenticated
USING (
  -- Users can view their own employee record
  user_id = auth.uid()
  OR
  -- Managers, admins, and HR can view all employee records
  public.has_role(auth.uid(), 'employer')
  OR
  public.has_role(auth.uid(), 'admin')
  OR
  public.has_role(auth.uid(), 'hr')
  OR
  public.has_role(auth.uid(), 'payroll')
)
WITH CHECK (
  -- Users can only modify their own records (limited fields)
  user_id = auth.uid()
  OR
  -- Managers, admins, and HR can modify employee records
  public.has_role(auth.uid(), 'employer')
  OR
  public.has_role(auth.uid(), 'admin')
  OR
  public.has_role(auth.uid(), 'hr')
);

-- Add indexes for security-sensitive queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
