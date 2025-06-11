
-- Fix the security issue by setting a secure search_path for the function
CREATE OR REPLACE FUNCTION public.update_attendance_status()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Update current_status based on the record state
    IF NEW.active_session = true AND NEW.on_break = true THEN
        NEW.current_status = 'on-break';
    ELSIF NEW.active_session = true AND NEW.on_break = false THEN
        NEW.current_status = 'clocked-in';
    ELSE
        NEW.current_status = 'clocked-out';
    END IF;
    
    RETURN NEW;
END;
$$;
