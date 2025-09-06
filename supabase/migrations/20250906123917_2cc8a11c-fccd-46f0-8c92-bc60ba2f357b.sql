-- Streamline roles to only: employee, manager, payroll

-- 1) Prioritize 'manager' in primary role resolution
CREATE OR REPLACE FUNCTION public.get_user_primary_role(p_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role
  FROM user_roles
  WHERE user_id = p_user_id
  ORDER BY 
    CASE role 
      WHEN 'manager' THEN 1
      WHEN 'payroll' THEN 2
      WHEN 'employee' THEN 3
      ELSE 99
    END
  LIMIT 1;
$function$;

-- 2) Clean up deprecated roles from users and normalize employee records
UPDATE employees SET role = 'manager' WHERE role IN ('employer','admin','hr');
DELETE FROM user_roles WHERE role IN ('admin','hr','employer');

-- 3) Expand RLS to grant 'manager' the same privileges previously granted to admin/employer/hr

-- attendance: full manage + view
CREATE POLICY "Managers can manage attendance"
ON attendance
FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "Managers can view all attendance"
ON attendance
FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('manager','payroll')));

-- availability_patterns: allow managers to manage
CREATE POLICY "Managers can manage availability"
ON availability_patterns
FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

-- availability_requests: managers can view and update any
CREATE POLICY "Managers can view all availability requests (manager role)"
ON availability_requests
FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "Managers can update any availability request (manager role)"
ON availability_requests
FOR UPDATE
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

-- calendar_preferences: managers can manage all
CREATE POLICY "Managers can manage all calendar preferences (manager role)"
ON calendar_preferences
FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

-- documents: managers full manage + view
CREATE POLICY "Managers can manage documents"
ON documents
FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "manager_view_documents"
ON documents
FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "authorized_manager_delete_documents"
ON documents
FOR DELETE
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "authorized_manager_insert_documents"
ON documents
FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "authorized_manager_update_documents"
ON documents
FOR UPDATE
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

-- gps_clocking_restrictions: managers can create/update/view
CREATE POLICY "Managers can create GPS restrictions (manager role)"
ON gps_clocking_restrictions
FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "Managers can update GPS restrictions (manager role)"
ON gps_clocking_restrictions
FOR UPDATE
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "Managers can view GPS restrictions (manager role)"
ON gps_clocking_restrictions
FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

-- labor_costs: managers can view
CREATE POLICY "Managers can view labor costs (manager role)"
ON labor_costs
FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

-- employee_location_logs: managers can view
CREATE POLICY "Managers can view all location logs (manager role)"
ON employee_location_logs
FOR SELECT
USING (
  (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager')
);

-- chats: managers can create/update/view like admins
CREATE POLICY "Managers can create chats (manager role)"
ON chats
FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "Managers can update chats (manager role)"
ON chats
FOR UPDATE
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "Managers can view chats (manager role)"
ON chats
FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

-- leave_calendar: managers can manage/update/view
CREATE POLICY "Managers can manage all leave (manager role)"
ON leave_calendar
FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "Managers can update any leave request (manager role)"
ON leave_calendar
FOR UPDATE
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'))
WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));

CREATE POLICY "Managers can view all leave requests (manager role)"
ON leave_calendar
FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager'));
