
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Employees can view their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Managers can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Employees can insert their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Employees can update their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Managers can update all attendance" ON public.attendance;

-- Ensure the attendance table has proper RLS enabled
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policy that allows employees to view their own attendance records
CREATE POLICY "Employees can view their own attendance" 
  ON public.attendance 
  FOR SELECT 
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Create policy that allows managers/admins/HR to view all attendance records
CREATE POLICY "Managers can view all attendance" 
  ON public.attendance 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('employer', 'admin', 'hr', 'manager')
    )
  );

-- Create policy for employees to insert their own attendance (when clocking in/out)
CREATE POLICY "Employees can insert their own attendance" 
  ON public.attendance 
  FOR INSERT 
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Create policy for employees to update their own attendance (when clocking out or taking breaks)
CREATE POLICY "Employees can update their own attendance" 
  ON public.attendance 
  FOR UPDATE 
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Create policy for managers to update any attendance record
CREATE POLICY "Managers can update all attendance" 
  ON public.attendance 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('employer', 'admin', 'hr', 'manager')
    )
  );

-- Enable realtime for attendance table so stats update in real-time
ALTER TABLE public.attendance REPLICA IDENTITY FULL;

-- Add table to realtime publication (this might already be done, but it's safe to run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'attendance'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
  END IF;
END $$;

-- Create some sample attendance data for testing if employees don't have data
INSERT INTO public.attendance (
  employee_id, 
  date, 
  check_in, 
  check_out, 
  attendance_status,
  working_minutes,
  status
)
SELECT 
  e.id,
  CURRENT_DATE - (random() * 30)::integer,
  (CURRENT_DATE - (random() * 30)::integer + time '08:00:00' + (random() * interval '2 hours')),
  (CURRENT_DATE - (random() * 30)::integer + time '17:00:00' + (random() * interval '2 hours')),
  CASE 
    WHEN random() < 0.8 THEN 'Present'::attendance_status_type
    WHEN random() < 0.9 THEN 'Late'::attendance_status_type
    ELSE 'Absent'::attendance_status_type
  END,
  480 + (random() * 120)::integer,
  'Present'
FROM employees e
WHERE e.user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM attendance a 
  WHERE a.employee_id = e.id 
  AND a.date >= CURRENT_DATE - 30
)
LIMIT 50;
