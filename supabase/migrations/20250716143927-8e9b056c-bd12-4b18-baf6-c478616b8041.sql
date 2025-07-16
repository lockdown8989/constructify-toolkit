-- Create shift template assignments table
CREATE TABLE public.shift_template_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_template_id UUID NOT NULL REFERENCES shift_templates(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate assignments
ALTER TABLE public.shift_template_assignments 
ADD CONSTRAINT unique_shift_template_employee 
UNIQUE (shift_template_id, employee_id);

-- Enable RLS
ALTER TABLE public.shift_template_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Managers can manage all shift template assignments"
  ON public.shift_template_assignments
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('employer', 'admin', 'hr', 'manager')
  ));

CREATE POLICY "Employees can view their own assignments"
  ON public.shift_template_assignments
  FOR SELECT
  USING (employee_id IN (
    SELECT id FROM employees
    WHERE user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_shift_template_assignments_template_id ON public.shift_template_assignments(shift_template_id);
CREATE INDEX idx_shift_template_assignments_employee_id ON public.shift_template_assignments(employee_id);

-- Create trigger for updated_at
CREATE TRIGGER update_shift_template_assignments_updated_at
  BEFORE UPDATE ON public.shift_template_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();