-- Allow payroll users to view all attendance data
CREATE POLICY "Payroll users can view all attendance data" 
ON public.attendance 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'payroll'
));