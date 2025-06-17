
-- Create a table to store clock action notifications if it doesn't exist
CREATE TABLE IF NOT EXISTS public.clock_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'clock_in', 'clock_out', 'break_start', 'break_end'
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attendance_id UUID REFERENCES public.attendance(id)
);

-- Add Row Level Security
ALTER TABLE public.clock_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for employees to see their own notifications
CREATE POLICY "Employees can view their own clock notifications" 
  ON public.clock_notifications 
  FOR SELECT 
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- Create policy for inserting notifications
CREATE POLICY "System can insert clock notifications" 
  ON public.clock_notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to log clock actions
CREATE OR REPLACE FUNCTION public.log_clock_action(
  p_employee_id UUID,
  p_action_type TEXT,
  p_message TEXT,
  p_attendance_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO clock_notifications (employee_id, action_type, message, attendance_id)
  VALUES (p_employee_id, p_action_type, p_message, p_attendance_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Create trigger function for attendance changes
CREATE OR REPLACE FUNCTION public.notify_clock_actions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  employee_name TEXT;
  action_message TEXT;
BEGIN
  -- Get employee name
  SELECT name INTO employee_name
  FROM employees 
  WHERE id = NEW.employee_id;
  
  -- Handle clock in
  IF OLD.check_in IS NULL AND NEW.check_in IS NOT NULL THEN
    action_message := 'Successfully clocked in at ' || to_char(NEW.check_in, 'HH24:MI');
    PERFORM log_clock_action(NEW.employee_id, 'clock_in', action_message, NEW.id);
  END IF;
  
  -- Handle clock out
  IF OLD.check_out IS NULL AND NEW.check_out IS NOT NULL THEN
    action_message := 'Successfully clocked out at ' || to_char(NEW.check_out, 'HH24:MI');
    PERFORM log_clock_action(NEW.employee_id, 'clock_out', action_message, NEW.id);
  END IF;
  
  -- Handle break start
  IF OLD.on_break = false AND NEW.on_break = true THEN
    action_message := 'Break started at ' || to_char(NEW.break_start, 'HH24:MI');
    PERFORM log_clock_action(NEW.employee_id, 'break_start', action_message, NEW.id);
  END IF;
  
  -- Handle break end
  IF OLD.on_break = true AND NEW.on_break = false THEN
    action_message := 'Break ended, back to work!';
    PERFORM log_clock_action(NEW.employee_id, 'break_end', action_message, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_notify_clock_actions ON public.attendance;
CREATE TRIGGER trigger_notify_clock_actions
  AFTER UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_clock_actions();
