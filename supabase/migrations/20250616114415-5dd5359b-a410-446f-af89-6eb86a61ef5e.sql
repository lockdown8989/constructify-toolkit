
-- Add weekly availability columns to employees table if they don't exist
DO $$ 
BEGIN
    -- Check and add weekly availability columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'monday_available') THEN
        ALTER TABLE public.employees ADD COLUMN monday_available boolean DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'monday_start_time') THEN
        ALTER TABLE public.employees ADD COLUMN monday_start_time time DEFAULT '09:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'monday_end_time') THEN
        ALTER TABLE public.employees ADD COLUMN monday_end_time time DEFAULT '17:00';
    END IF;
    
    -- Repeat for all days of the week
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'tuesday_available') THEN
        ALTER TABLE public.employees ADD COLUMN tuesday_available boolean DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'tuesday_start_time') THEN
        ALTER TABLE public.employees ADD COLUMN tuesday_start_time time DEFAULT '09:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'tuesday_end_time') THEN
        ALTER TABLE public.employees ADD COLUMN tuesday_end_time time DEFAULT '17:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'wednesday_available') THEN
        ALTER TABLE public.employees ADD COLUMN wednesday_available boolean DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'wednesday_start_time') THEN
        ALTER TABLE public.employees ADD COLUMN wednesday_start_time time DEFAULT '09:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'wednesday_end_time') THEN
        ALTER TABLE public.employees ADD COLUMN wednesday_end_time time DEFAULT '17:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'thursday_available') THEN
        ALTER TABLE public.employees ADD COLUMN thursday_available boolean DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'thursday_start_time') THEN
        ALTER TABLE public.employees ADD COLUMN thursday_start_time time DEFAULT '09:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'thursday_end_time') THEN
        ALTER TABLE public.employees ADD COLUMN thursday_end_time time DEFAULT '17:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'friday_available') THEN
        ALTER TABLE public.employees ADD COLUMN friday_available boolean DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'friday_start_time') THEN
        ALTER TABLE public.employees ADD COLUMN friday_start_time time DEFAULT '09:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'friday_end_time') THEN
        ALTER TABLE public.employees ADD COLUMN friday_end_time time DEFAULT '17:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'saturday_available') THEN
        ALTER TABLE public.employees ADD COLUMN saturday_available boolean DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'saturday_start_time') THEN
        ALTER TABLE public.employees ADD COLUMN saturday_start_time time DEFAULT '09:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'saturday_end_time') THEN
        ALTER TABLE public.employees ADD COLUMN saturday_end_time time DEFAULT '17:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'sunday_available') THEN
        ALTER TABLE public.employees ADD COLUMN sunday_available boolean DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'sunday_start_time') THEN
        ALTER TABLE public.employees ADD COLUMN sunday_start_time time DEFAULT '09:00';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'sunday_end_time') THEN
        ALTER TABLE public.employees ADD COLUMN sunday_end_time time DEFAULT '17:00';
    END IF;
END $$;

-- Create shift notifications table for tracking automated notifications
CREATE TABLE IF NOT EXISTS public.shift_notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid REFERENCES public.employees(id) NOT NULL,
    shift_date date NOT NULL,
    shift_start_time time NOT NULL,
    shift_end_time time NOT NULL,
    notification_type text NOT NULL CHECK (notification_type IN ('shift_start_reminder', 'shift_end_reminder')),
    notification_time timestamp with time zone NOT NULL,
    sent boolean DEFAULT false,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Create index for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_shift_notifications_pending ON public.shift_notifications(notification_time, sent) WHERE sent = false;

-- Create function to automatically create shift notifications based on employee availability
CREATE OR REPLACE FUNCTION public.create_shift_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    emp_record record;
    notification_date date;
    start_notification_time timestamp with time zone;
    end_notification_time timestamp with time zone;
    day_column_available text;
    day_column_start text;
    day_column_end text;
    is_available boolean;
    shift_start time;
    shift_end time;
BEGIN
    -- Loop through next 7 days
    FOR i IN 0..6 LOOP
        notification_date := CURRENT_DATE + i;
        
        -- Get day of week (0=Sunday, 1=Monday, etc.)
        CASE EXTRACT(DOW FROM notification_date)
            WHEN 0 THEN 
                day_column_available := 'sunday_available';
                day_column_start := 'sunday_start_time';
                day_column_end := 'sunday_end_time';
            WHEN 1 THEN 
                day_column_available := 'monday_available';
                day_column_start := 'monday_start_time';
                day_column_end := 'monday_end_time';
            WHEN 2 THEN 
                day_column_available := 'tuesday_available';
                day_column_start := 'tuesday_start_time';
                day_column_end := 'tuesday_end_time';
            WHEN 3 THEN 
                day_column_available := 'wednesday_available';
                day_column_start := 'wednesday_start_time';
                day_column_end := 'wednesday_end_time';
            WHEN 4 THEN 
                day_column_available := 'thursday_available';
                day_column_start := 'thursday_start_time';
                day_column_end := 'thursday_end_time';
            WHEN 5 THEN 
                day_column_available := 'friday_available';
                day_column_start := 'friday_start_time';
                day_column_end := 'friday_end_time';
            WHEN 6 THEN 
                day_column_available := 'saturday_available';
                day_column_start := 'saturday_start_time';
                day_column_end := 'saturday_end_time';
        END CASE;
        
        -- Loop through employees and create notifications
        FOR emp_record IN 
            SELECT id, 
                   CASE day_column_available
                       WHEN 'sunday_available' THEN sunday_available
                       WHEN 'monday_available' THEN monday_available
                       WHEN 'tuesday_available' THEN tuesday_available
                       WHEN 'wednesday_available' THEN wednesday_available
                       WHEN 'thursday_available' THEN thursday_available
                       WHEN 'friday_available' THEN friday_available
                       WHEN 'saturday_available' THEN saturday_available
                   END as is_available,
                   CASE day_column_start
                       WHEN 'sunday_start_time' THEN sunday_start_time
                       WHEN 'monday_start_time' THEN monday_start_time
                       WHEN 'tuesday_start_time' THEN tuesday_start_time
                       WHEN 'wednesday_start_time' THEN wednesday_start_time
                       WHEN 'thursday_start_time' THEN thursday_start_time
                       WHEN 'friday_start_time' THEN friday_start_time
                       WHEN 'saturday_start_time' THEN saturday_start_time
                   END as shift_start,
                   CASE day_column_end
                       WHEN 'sunday_end_time' THEN sunday_end_time
                       WHEN 'monday_end_time' THEN monday_end_time
                       WHEN 'tuesday_end_time' THEN tuesday_end_time
                       WHEN 'wednesday_end_time' THEN wednesday_end_time
                       WHEN 'thursday_end_time' THEN thursday_end_time
                       WHEN 'friday_end_time' THEN friday_end_time
                       WHEN 'saturday_end_time' THEN saturday_end_time
                   END as shift_end
            FROM employees
            WHERE status = 'Active'
        LOOP
            -- Only create notifications for available days
            IF emp_record.is_available AND emp_record.shift_start IS NOT NULL AND emp_record.shift_end IS NOT NULL THEN
                -- Calculate notification times (10 minutes before start and end)
                start_notification_time := notification_date + emp_record.shift_start - interval '10 minutes';
                end_notification_time := notification_date + emp_record.shift_end - interval '10 minutes';
                
                -- Insert start reminder notification if it doesn't exist
                INSERT INTO shift_notifications (
                    employee_id, 
                    shift_date, 
                    shift_start_time, 
                    shift_end_time,
                    notification_type, 
                    notification_time
                )
                SELECT 
                    emp_record.id,
                    notification_date,
                    emp_record.shift_start,
                    emp_record.shift_end,
                    'shift_start_reminder',
                    start_notification_time
                WHERE NOT EXISTS (
                    SELECT 1 FROM shift_notifications 
                    WHERE employee_id = emp_record.id 
                    AND shift_date = notification_date 
                    AND notification_type = 'shift_start_reminder'
                );
                
                -- Insert end reminder notification if it doesn't exist
                INSERT INTO shift_notifications (
                    employee_id, 
                    shift_date, 
                    shift_start_time, 
                    shift_end_time,
                    notification_type, 
                    notification_time
                )
                SELECT 
                    emp_record.id,
                    notification_date,
                    emp_record.shift_start,
                    emp_record.shift_end,
                    'shift_end_reminder',
                    end_notification_time
                WHERE NOT EXISTS (
                    SELECT 1 FROM shift_notifications 
                    WHERE employee_id = emp_record.id 
                    AND shift_date = notification_date 
                    AND notification_type = 'shift_end_reminder'
                );
            END IF;
        END LOOP;
    END LOOP;
END;
$function$;

-- Create function to send due notifications
CREATE OR REPLACE FUNCTION public.send_due_shift_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    notification_record record;
    notification_message text;
    notification_title text;
BEGIN
    -- Find notifications that are due to be sent
    FOR notification_record IN
        SELECT sn.*, e.user_id, e.name
        FROM shift_notifications sn
        JOIN employees e ON e.id = sn.employee_id
        WHERE sn.sent = false
        AND sn.notification_time <= now()
        AND e.user_id IS NOT NULL
    LOOP
        -- Determine notification content based on type
        IF notification_record.notification_type = 'shift_start_reminder' THEN
            notification_title := '🔔 Shift Starting Soon';
            notification_message := 'Your shift starts in 10 minutes at ' || 
                                   to_char(notification_record.shift_start_time, 'HH24:MI') || 
                                   '. Don''t forget to clock in!';
        ELSE
            notification_title := '🔔 Shift Ending Soon';
            notification_message := 'Your shift ends in 10 minutes at ' || 
                                   to_char(notification_record.shift_end_time, 'HH24:MI') || 
                                   '. Remember to clock out on time to avoid overtime.';
        END IF;
        
        -- Insert notification
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            related_entity,
            related_id
        ) VALUES (
            notification_record.user_id,
            notification_title,
            notification_message,
            'info',
            'shift_notifications',
            notification_record.id::text
        );
        
        -- Mark notification as sent
        UPDATE shift_notifications 
        SET sent = true, sent_at = now()
        WHERE id = notification_record.id;
    END LOOP;
END;
$function$;

-- Enhanced attendance trigger to handle overtime calculations
CREATE OR REPLACE FUNCTION public.calculate_overtime_and_lateness()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    employee_record record;
    scheduled_start time;
    scheduled_end time;
    day_of_week int;
    is_late boolean := false;
    late_minutes int := 0;
    overtime_minutes int := 0;
    check_in_time time;
    check_out_time time;
BEGIN
    -- Get employee availability for the day
    day_of_week := EXTRACT(DOW FROM NEW.date);
    
    SELECT 
        CASE day_of_week
            WHEN 0 THEN sunday_start_time
            WHEN 1 THEN monday_start_time
            WHEN 2 THEN tuesday_start_time
            WHEN 3 THEN wednesday_start_time
            WHEN 4 THEN thursday_start_time
            WHEN 5 THEN friday_start_time
            WHEN 6 THEN saturday_start_time
        END as start_time,
        CASE day_of_week
            WHEN 0 THEN sunday_end_time
            WHEN 1 THEN monday_end_time
            WHEN 2 THEN tuesday_end_time
            WHEN 3 THEN wednesday_end_time
            WHEN 4 THEN thursday_end_time
            WHEN 5 THEN friday_end_time
            WHEN 6 THEN saturday_end_time
        END as end_time
    INTO scheduled_start, scheduled_end
    FROM employees
    WHERE id = NEW.employee_id;
    
    -- Calculate lateness if check_in exists
    IF NEW.check_in IS NOT NULL AND scheduled_start IS NOT NULL THEN
        check_in_time := NEW.check_in::time;
        
        IF check_in_time > scheduled_start THEN
            is_late := true;
            late_minutes := EXTRACT(EPOCH FROM (check_in_time - scheduled_start))/60;
        END IF;
        
        NEW.is_late := is_late;
        NEW.late_minutes := late_minutes;
        NEW.scheduled_start_time := scheduled_start;
    END IF;
    
    -- Calculate overtime if check_out exists
    IF NEW.check_out IS NOT NULL AND scheduled_end IS NOT NULL THEN
        check_out_time := NEW.check_out::time;
        NEW.scheduled_end_time := scheduled_end;
        
        -- If clocked out after scheduled end time, calculate overtime
        IF check_out_time > scheduled_end THEN
            overtime_minutes := EXTRACT(EPOCH FROM (check_out_time - scheduled_end))/60;
            NEW.overtime_minutes := COALESCE(NEW.overtime_minutes, 0) + overtime_minutes;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create trigger for overtime and lateness calculations
DROP TRIGGER IF EXISTS trigger_calculate_overtime_lateness ON public.attendance;
CREATE TRIGGER trigger_calculate_overtime_lateness
    BEFORE INSERT OR UPDATE ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_overtime_and_lateness();

-- Enable RLS on shift_notifications table
ALTER TABLE public.shift_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for shift_notifications
CREATE POLICY "Employees can view their own shift notifications" 
ON public.shift_notifications 
FOR SELECT 
USING (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Managers can view all shift notifications" 
ON public.shift_notifications 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('employer', 'admin', 'hr', 'manager')
    )
);
