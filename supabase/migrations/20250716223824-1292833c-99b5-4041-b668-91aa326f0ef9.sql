
-- Enable Row Level Security on data_retention_policy table
ALTER TABLE public.data_retention_policy ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage data retention policies
CREATE POLICY "Admins can manage data retention policies" 
ON public.data_retention_policy 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr')
  )
);

-- Create policy for system operations (like cleanup functions)
CREATE POLICY "System can read data retention policies" 
ON public.data_retention_policy 
FOR SELECT 
TO authenticated
USING (true);
