
-- Enable RLS on open_shift_assignments table if not already enabled
ALTER TABLE public.open_shift_assignments ENABLE ROW LEVEL SECURITY;

-- Allow employees to create their own shift assignments when claiming shifts
CREATE POLICY "Employees can create shift assignments for themselves" 
ON public.open_shift_assignments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = employee_id AND user_id = auth.uid()
  )
);

-- Allow managers and admins to create shift assignments for any employee
CREATE POLICY "Managers can create shift assignments" 
ON public.open_shift_assignments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('employer', 'admin', 'hr')
  )
);

-- Allow users to view shift assignments they are involved in
CREATE POLICY "Users can view their own shift assignments" 
ON public.open_shift_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = employee_id AND user_id = auth.uid()
  ) OR
  assigned_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('employer', 'admin', 'hr')
  )
);

-- Allow managers to update shift assignments
CREATE POLICY "Managers can update shift assignments" 
ON public.open_shift_assignments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('employer', 'admin', 'hr')
  )
);

-- Allow managers to delete shift assignments
CREATE POLICY "Managers can delete shift assignments" 
ON public.open_shift_assignments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('employer', 'admin', 'hr')
  )
);
