-- Drop the conflicting policy and create a more comprehensive one
DROP POLICY IF EXISTS "Managers can manage all shift template assignments" ON public.shift_template_assignments;
DROP POLICY IF EXISTS "Employees can view their own assignments" ON public.shift_template_assignments;
DROP POLICY IF EXISTS "Authenticated users can manage shift template assignments" ON public.shift_template_assignments;

-- Create a comprehensive policy that allows authenticated users to manage assignments
CREATE POLICY "Allow authenticated users to manage assignments"
  ON public.shift_template_assignments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);