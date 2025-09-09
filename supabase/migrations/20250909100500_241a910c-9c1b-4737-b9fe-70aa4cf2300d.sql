-- Security fixes for critical vulnerabilities

-- 1. Fix user_roles privilege escalation vulnerability
DROP POLICY IF EXISTS "Users can insert their initial role during signup" ON public.user_roles;

CREATE POLICY "Users can set a safe initial role once"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = ANY (ARRAY['employee'::app_role, 'manager'::app_role, 'payroll'::app_role])
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()
  )
);

-- 2. Fix interviews table unauthorized access
DROP POLICY IF EXISTS "Authenticated users can view all interviews" ON public.interviews;

CREATE POLICY "HR and admins can view interviews"
ON public.interviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('hr'::app_role, 'admin'::app_role)
  )
);

-- 3. Fix chat_participants policy inconsistency
DROP POLICY IF EXISTS "Users can manage their own participation" ON public.chat_participants;

CREATE POLICY "Users can manage their own participation"
ON public.chat_participants
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Add strict private document access policy
CREATE POLICY "Employees can view their own private documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  access_level = 'private'
  AND employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);