-- Temporarily disable the trigger
DROP TRIGGER IF EXISTS handle_shift_status_change_trigger ON schedules;

-- Update all pending shifts to confirmed status
UPDATE schedules 
SET 
  status = 'confirmed',
  published = true,
  published_at = now(),
  approval_required = false,
  can_be_edited = false
WHERE status = 'pending';

-- Re-enable the trigger with a fixed function
CREATE OR REPLACE FUNCTION public.handle_shift_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  employee_name text;
BEGIN
  -- Get employee name
  SELECT name INTO employee_name
  FROM employees 
  WHERE id = NEW.employee_id;
  
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
        ELSE '📝 Shift Status Updated'
      END,
      COALESCE(employee_name, 'Unknown Employee') || 
      CASE 
        WHEN NEW.status = 'employee_accepted' THEN ' has accepted'
        WHEN NEW.status = 'employee_rejected' THEN ' has rejected'
        ELSE ' has updated status for'
      END ||
      ' the shift scheduled for ' || to_char(NEW.start_time, 'Month DD, YYYY HH24:MI'),
      CASE 
        WHEN NEW.status = 'employee_accepted' THEN 'success'
        WHEN NEW.status = 'employee_rejected' THEN 'warning'
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

-- Re-create the trigger
CREATE TRIGGER handle_shift_status_change_trigger
  AFTER UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION handle_shift_status_change();