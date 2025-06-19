
-- Optimize RLS policies for documents table to fix performance warnings
-- This addresses the RLS Initialization Plan warnings by using security definer functions

-- First, create helper functions that will be cached per query instead of per row
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT role::text FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_employee_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT id FROM employees WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_has_role(role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role::text = role_name
  );
$$;

-- Drop existing policies on documents table
DROP POLICY IF EXISTS "employee_view_own_documents" ON documents;
DROP POLICY IF EXISTS "payroll_view_all_documents" ON documents;
DROP POLICY IF EXISTS "managers_view_documents" ON documents;
DROP POLICY IF EXISTS "authorized_insert_documents" ON documents;
DROP POLICY IF EXISTS "authorized_update_documents" ON documents;
DROP POLICY IF EXISTS "authorized_delete_documents" ON documents;

-- Create optimized policies using the helper functions
-- Policy for employees to view their own documents
CREATE POLICY "employees_view_own_documents" 
ON documents 
FOR SELECT 
TO authenticated
USING (
  employee_id = get_current_user_employee_id()
);

-- Policy for privileged users to view all documents
CREATE POLICY "privileged_users_view_all_documents" 
ON documents 
FOR SELECT 
TO authenticated
USING (
  current_user_has_role('payroll') OR
  current_user_has_role('employer') OR
  current_user_has_role('admin') OR
  current_user_has_role('hr')
);

-- Policy for inserting documents (privileged users only)
CREATE POLICY "privileged_users_insert_documents" 
ON documents 
FOR INSERT 
TO authenticated
WITH CHECK (
  current_user_has_role('payroll') OR
  current_user_has_role('employer') OR
  current_user_has_role('admin') OR
  current_user_has_role('hr')
);

-- Policy for updating documents (privileged users only)
CREATE POLICY "privileged_users_update_documents" 
ON documents 
FOR UPDATE 
TO authenticated
USING (
  current_user_has_role('payroll') OR
  current_user_has_role('employer') OR
  current_user_has_role('admin') OR
  current_user_has_role('hr')
)
WITH CHECK (
  current_user_has_role('payroll') OR
  current_user_has_role('employer') OR
  current_user_has_role('admin') OR
  current_user_has_role('hr')
);

-- Policy for deleting documents (privileged users only)
CREATE POLICY "privileged_users_delete_documents" 
ON documents 
FOR DELETE 
TO authenticated
USING (
  current_user_has_role('payroll') OR
  current_user_has_role('employer') OR
  current_user_has_role('admin') OR
  current_user_has_role('hr')
);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_documents_employee_id_btree ON documents USING btree (employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_category_btree ON documents USING btree (category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at_btree ON documents USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by_btree ON documents USING btree (uploaded_by);

-- Add index for RLS lookup optimization
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON user_roles USING btree (user_id, role);
CREATE INDEX IF NOT EXISTS idx_employees_user_id_btree ON employees USING btree (user_id);

-- Comment explaining the optimization
COMMENT ON FUNCTION public.get_current_user_role() IS 'Optimized function to get current user role - cached per query to improve RLS performance';
COMMENT ON FUNCTION public.get_current_user_employee_id() IS 'Optimized function to get current user employee ID - cached per query to improve RLS performance';
COMMENT ON FUNCTION public.current_user_has_role(text) IS 'Optimized function to check user role - cached per query to improve RLS performance';
