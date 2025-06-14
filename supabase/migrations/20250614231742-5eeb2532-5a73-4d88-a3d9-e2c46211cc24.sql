
-- First, let's drop existing policies if they exist and recreate them properly
DROP POLICY IF EXISTS "Employees can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Payroll can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Managers can view team documents" ON public.documents;
DROP POLICY IF EXISTS "Payroll and managers can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Payroll and managers can update documents" ON public.documents;
DROP POLICY IF EXISTS "Payroll and managers can delete documents" ON public.documents;

-- Enable Row Level Security on documents table (in case it's not enabled)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policy that allows employees to view their own documents
CREATE POLICY "employee_view_own_documents" 
  ON public.documents 
  FOR SELECT 
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Create policy that allows payroll users to view all documents
CREATE POLICY "payroll_view_all_documents" 
  ON public.documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'payroll'
    )
  );

-- Create policy that allows managers to view documents of their team members
CREATE POLICY "managers_view_documents" 
  ON public.documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('employer', 'admin', 'hr')
    )
  );

-- Create policy for inserting documents (payroll and managers only)
CREATE POLICY "authorized_insert_documents" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('payroll', 'employer', 'admin', 'hr')
    )
  );

-- Create policy for updating documents (payroll and managers only)
CREATE POLICY "authorized_update_documents" 
  ON public.documents 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('payroll', 'employer', 'admin', 'hr')
    )
  );

-- Create policy for deleting documents (payroll and managers only)
CREATE POLICY "authorized_delete_documents" 
  ON public.documents 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('payroll', 'employer', 'admin', 'hr')
    )
  );
