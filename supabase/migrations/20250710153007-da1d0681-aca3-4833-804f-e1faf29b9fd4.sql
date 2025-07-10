-- Create a function to mark expired open shifts
CREATE OR REPLACE FUNCTION public.mark_expired_open_shifts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  expired_count INTEGER := 0;
BEGIN
  -- Update open shifts that have expired
  UPDATE open_shifts 
  SET 
    status = 'expired',
    last_modified_platform = 'system'
  WHERE 
    status != 'expired' 
    AND status != 'cancelled'
    AND status != 'assigned'
    AND (
      -- Expired based on expiration_date
      (expiration_date IS NOT NULL AND expiration_date < NOW()) 
      OR 
      -- Expired based on start_time (shift has already started)
      (start_time < NOW())
    );
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Log the expiration activity
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
    'Open Shifts Expired',
    expired_count || ' open shifts have expired and been marked as unavailable.',
    'info',
    'open_shifts',
    NULL
  FROM user_roles ur
  WHERE ur.role IN ('employer', 'admin', 'hr')
  AND expired_count > 0;
  
  RETURN expired_count;
END;
$$;

-- Create a function to automatically clean up and mark expired shifts
CREATE OR REPLACE FUNCTION public.process_shift_expiration()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  expired_shifts_count INTEGER;
BEGIN
  -- Mark expired open shifts
  SELECT public.mark_expired_open_shifts() INTO expired_shifts_count;
  
  -- Update any schedule records that should be marked as expired
  UPDATE schedules
  SET 
    status = 'rejected',
    updated_at = NOW()
  WHERE 
    status = 'pending' 
    AND start_time < NOW() - INTERVAL '1 hour'; -- Grace period of 1 hour
    
  -- Log the processing
  RAISE NOTICE 'Processed % expired shifts', expired_shifts_count;
END;
$$;