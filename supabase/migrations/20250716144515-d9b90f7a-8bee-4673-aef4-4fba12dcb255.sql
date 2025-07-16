-- First, let's check if we have any users in the system and assign them admin role
INSERT INTO user_roles (user_id, role)
SELECT '4c88f25b-78b2-45ec-b6d6-22c4286e78df', 'admin'::app_role
ON CONFLICT (user_id, role) DO NOTHING;

-- Also create a more permissive policy for authenticated users
CREATE POLICY "Authenticated users can manage shift template assignments"
  ON public.shift_template_assignments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);