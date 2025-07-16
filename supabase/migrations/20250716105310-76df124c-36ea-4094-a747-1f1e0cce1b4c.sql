-- Fix the notification trigger function to handle null messages
CREATE OR REPLACE FUNCTION public.notify_managers_on_shift_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  employee_name text;
  manager_name text;
BEGIN
  -- Get employee name
  SELECT name INTO employee_name
  FROM employees 
  WHERE id = NEW.employee_id;
  
  -- Get manager name (fallback to 'System' if none found)
  SELECT e.name INTO manager_name
  FROM employees e
  WHERE e.user_id = auth.uid();
  
  -- Set fallback values
  employee_name := COALESCE(employee_name, 'Unknown Employee');
  manager_name := COALESCE(manager_name, 'System');
  
  -- Only trigger notifications when status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify managers about employee responses
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_entity,
      related_id
    )
    SELECT 
      ur.user_id,
      CASE 
        WHEN NEW.status = 'employee_accepted' THEN '✅ Shift Accepted by Employee'
        WHEN NEW.status = 'employee_rejected' THEN '❌ Shift Rejected by Employee'
        WHEN NEW.status = 'confirmed' THEN '✅ Shift Confirmed'
        ELSE '📝 Shift Status Updated'
      END,
      employee_name || 
      CASE 
        WHEN NEW.status = 'employee_accepted' THEN ' has accepted'
        WHEN NEW.status = 'employee_rejected' THEN ' has rejected'
        WHEN NEW.status = 'confirmed' THEN ' shift has been confirmed by ' || manager_name
        ELSE ' has updated status for'
      END ||
      ' the shift scheduled for ' || to_char(NEW.start_time, 'Month DD, YYYY HH24:MI'),
      CASE 
        WHEN NEW.status = 'employee_accepted' THEN 'success'
        WHEN NEW.status = 'employee_rejected' THEN 'warning'
        WHEN NEW.status = 'confirmed' THEN 'success'
        ELSE 'info'
      END,
      'schedules',
      NEW.id
    FROM user_roles ur
    WHERE ur.role IN ('employer', 'admin', 'hr');
  END IF;
  
  RETURN NEW;
END;
$function$;