
-- Create payroll_history table to track processing history
CREATE TABLE IF NOT EXISTS public.payroll_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_count INTEGER NOT NULL,
  success_count INTEGER NOT NULL,
  fail_count INTEGER NOT NULL,
  processed_by UUID REFERENCES auth.users(id),
  employee_ids UUID[] NOT NULL,
  processing_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add processing_date column to payroll table if it doesn't exist
ALTER TABLE public.payroll 
ADD COLUMN IF NOT EXISTS processing_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS on payroll_history table
ALTER TABLE public.payroll_history ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing payroll history (managers only)
CREATE POLICY "Managers can view payroll history" 
ON public.payroll_history
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('employer', 'admin', 'hr')
  )
);

-- Create policy for inserting payroll history (managers only)
CREATE POLICY "Managers can insert payroll history" 
ON public.payroll_history
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('employer', 'admin', 'hr')
  )
);
