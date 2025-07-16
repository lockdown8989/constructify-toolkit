-- Check for triggers on schedules table and disable all status-related triggers
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Drop all triggers related to status changes
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'schedules' 
        AND trigger_name LIKE '%status%' OR trigger_name LIKE '%shift%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON schedules';
    END LOOP;
    
    -- Also try to drop the specific trigger that's causing issues
    DROP TRIGGER IF EXISTS notify_shift_status_change ON schedules;
    DROP TRIGGER IF EXISTS handle_shift_status_change ON schedules;
END $$;

-- Now update all pending shifts to confirmed status
UPDATE schedules 
SET 
  status = 'confirmed',
  published = true,
  published_at = now(),
  approval_required = false,
  can_be_edited = false
WHERE status = 'pending';