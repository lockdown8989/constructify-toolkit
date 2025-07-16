-- Add missing foreign key constraints to shift_template_assignments table
ALTER TABLE public.shift_template_assignments 
ADD CONSTRAINT fk_shift_template_assignments_shift_template_id 
FOREIGN KEY (shift_template_id) REFERENCES public.shift_templates(id) ON DELETE CASCADE;

ALTER TABLE public.shift_template_assignments 
ADD CONSTRAINT fk_shift_template_assignments_employee_id 
FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Add indexes for better performance (if they don't exist already)
CREATE INDEX IF NOT EXISTS idx_shift_template_assignments_shift_template_id 
ON public.shift_template_assignments(shift_template_id);

CREATE INDEX IF NOT EXISTS idx_shift_template_assignments_employee_id 
ON public.shift_template_assignments(employee_id);

-- Ensure the updated_at trigger exists
CREATE TRIGGER IF NOT EXISTS update_shift_template_assignments_updated_at
  BEFORE UPDATE ON public.shift_template_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();