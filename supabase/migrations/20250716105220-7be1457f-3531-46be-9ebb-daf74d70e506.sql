-- Update all pending shifts to confirmed status
UPDATE schedules 
SET 
  status = 'confirmed',
  published = true,
  published_at = now(),
  approval_required = false,
  can_be_edited = false
WHERE status = 'pending';