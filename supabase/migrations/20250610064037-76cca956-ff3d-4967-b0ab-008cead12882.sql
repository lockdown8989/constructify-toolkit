
-- First, add the missing columns to employees table
DO $$ 
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'role' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN role TEXT DEFAULT 'employee';
  END IF;

  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'email' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN email TEXT;
  END IF;
END $$;

-- Add constraint to ensure role values are valid
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_role_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_role_check CHECK (role IN ('employee', 'payroll'));

-- Update the existing documents table structure if needed
DO $$
BEGIN
  -- Add title column if it doesn't exist (use name as title if available)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'title' AND table_schema = 'public'
  ) THEN
    -- Add title column and populate it from name column if it exists
    ALTER TABLE public.documents ADD COLUMN title TEXT;
    
    -- Copy data from name to title if name column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'documents' AND column_name = 'name' AND table_schema = 'public'
    ) THEN
      UPDATE public.documents SET title = name WHERE title IS NULL;
    END IF;
    
    -- Make title NOT NULL after populating it
    ALTER TABLE public.documents ALTER COLUMN title SET NOT NULL;
  END IF;

  -- Add category column if it doesn't exist (use document_type as category if available)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'category' AND table_schema = 'public'
  ) THEN
    -- Add category column and populate it from document_type column if it exists
    ALTER TABLE public.documents ADD COLUMN category TEXT;
    
    -- Copy data from document_type to category if document_type column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'documents' AND column_name = 'document_type' AND table_schema = 'public'
    ) THEN
      UPDATE public.documents SET category = document_type WHERE category IS NULL;
    END IF;
    
    -- Make category NOT NULL after populating it
    ALTER TABLE public.documents ALTER COLUMN category SET NOT NULL;
  END IF;
END $$;

-- Add constraint to ensure category values are valid
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_category_check;
ALTER TABLE public.documents ADD CONSTRAINT documents_category_check CHECK (category IN ('contract', 'p60', 'payslip', 'general', 'resume', 'id', 'certificate'));

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Payroll users can manage all documents" ON public.documents;
DROP POLICY IF EXISTS "Employees can view their own documents" ON public.documents;

-- Create policies for document access
-- Policy for payroll users to manage all documents
CREATE POLICY "Payroll users can manage all documents"
ON public.documents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.user_id = auth.uid() AND e.role = 'payroll'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.user_id = auth.uid() AND e.role = 'payroll'
  )
);

-- Policy for employees to view only their own documents
CREATE POLICY "Employees can view their own documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees
    WHERE user_id = auth.uid() AND role = 'employee'
  )
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_documents_employee_id ON public.documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
