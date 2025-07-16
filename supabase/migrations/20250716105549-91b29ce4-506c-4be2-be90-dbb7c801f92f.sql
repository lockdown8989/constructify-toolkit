-- Disable all notification triggers temporarily
DROP TRIGGER IF EXISTS handle_shift_status_change_trigger ON schedules;
DROP TRIGGER IF EXISTS notify_managers_on_shift_response_trigger ON schedules;
DROP TRIGGER IF EXISTS notify_shift_status_change_trigger ON schedules;

-- Update all pending shifts to confirmed status
UPDATE schedules 
SET 
  status = 'confirmed',
  published = true,
  published_at = now(),
  approval_required = false,
  can_be_edited = false
WHERE status = 'pending';