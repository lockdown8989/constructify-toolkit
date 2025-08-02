-- Check existing enum values and add 'incomplete' status
DO $$ 
BEGIN
    -- Add 'incomplete' to existing attendance_status_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'incomplete' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'attendance_status_type')) THEN
        ALTER TYPE attendance_status_type ADD VALUE 'incomplete';
    END IF;
END $$;

-- Update schedules table to add 'incomplete' status option (schedules doesn't use enum, it uses text)
-- No enum change needed for schedules table as it uses text type

-- Add function to check rota pattern compliance and mark incomplete attendance
CREATE OR REPLACE FUNCTION public.check_rota_pattern_compliance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    schedule_record record;
    rota_shift record;
    attendance_record record;
    missing_clock_in boolean := false;
    missing_clock_out boolean := false;
BEGIN
    -- Check all confirmed rota schedules from the past 30 days
    FOR schedule_record IN
        SELECT s.*, e.user_id, e.name as employee_name
        FROM schedules s
        JOIN employees e ON e.id = s.employee_id
        WHERE s.template_id IS NOT NULL  -- Rota pattern schedule
        AND s.status IN ('confirmed', 'employee_accepted')
        AND DATE(s.start_time) >= CURRENT_DATE - INTERVAL '30 days'
        AND DATE(s.start_time) <= CURRENT_DATE
    LOOP
        -- Get the rota shift pattern details
        SELECT * INTO rota_shift
        FROM get_employee_rota_shift_times(schedule_record.employee_id, DATE(schedule_record.start_time))
        LIMIT 1;
        
        IF FOUND THEN
            -- Check if attendance record exists for this date
            SELECT * INTO attendance_record
            FROM attendance
            WHERE employee_id = schedule_record.employee_id
            AND date = DATE(schedule_record.start_time)
            LIMIT 1;
            
            -- Determine if attendance is incomplete
            missing_clock_in := (attendance_record IS NULL OR attendance_record.check_in IS NULL);
            missing_clock_out := (attendance_record IS NULL OR attendance_record.check_out IS NULL);
            
            -- Mark schedule as incomplete if employee didn't follow rota pattern
            IF missing_clock_in OR missing_clock_out THEN
                UPDATE schedules 
                SET 
                    status = 'incomplete',
                    notes = COALESCE(notes, '') || 
                           CASE 
                               WHEN missing_clock_in AND missing_clock_out THEN ' [INCOMPLETE: No clock in/out recorded]'
                               WHEN missing_clock_in THEN ' [INCOMPLETE: Missing clock in]'
                               WHEN missing_clock_out THEN ' [INCOMPLETE: Missing clock out]'
                           END,
                    updated_at = NOW()
                WHERE id = schedule_record.id;
                
                -- Create/update attendance record to reflect incomplete status
                INSERT INTO attendance (
                    employee_id,
                    date,
                    status,
                    attendance_status,
                    notes,
                    scheduled_start_time,
                    scheduled_end_time
                ) VALUES (
                    schedule_record.employee_id,
                    DATE(schedule_record.start_time),
                    'Incomplete',
                    'Absent',
                    CASE 
                        WHEN missing_clock_in AND missing_clock_out THEN 'Failed to clock in and out according to rota pattern'
                        WHEN missing_clock_in THEN 'Failed to clock in according to rota pattern'
                        WHEN missing_clock_out THEN 'Failed to clock out according to rota pattern'
                    END,
                    rota_shift.start_time,
                    rota_shift.end_time
                ) ON CONFLICT (employee_id, date) DO UPDATE SET
                    status = 'Incomplete',
                    attendance_status = 'Absent',
                    notes = COALESCE(attendance.notes, '') || ' | ' || EXCLUDED.notes,
                    scheduled_start_time = EXCLUDED.scheduled_start_time,
                    scheduled_end_time = EXCLUDED.scheduled_end_time;
                
                -- Notify managers about incomplete rota compliance
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
                    '❌ Rota Pattern Violation',
                    schedule_record.employee_name || ' failed to follow rota pattern on ' || 
                    DATE(schedule_record.start_time) || '. ' ||
                    CASE 
                        WHEN missing_clock_in AND missing_clock_out THEN 'No clock in/out recorded.'
                        WHEN missing_clock_in THEN 'Missing clock in.'
                        WHEN missing_clock_out THEN 'Missing clock out.'
                    END,
                    'warning',
                    'schedule',
                    schedule_record.id
                FROM user_roles ur
                WHERE ur.role IN ('admin', 'employer', 'hr', 'manager');
            END IF;
        END IF;
    END LOOP;
END;
$function$;

-- Create trigger to automatically check compliance when attendance is updated
CREATE OR REPLACE FUNCTION public.trigger_rota_compliance_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    -- Schedule a compliance check for this employee's rota patterns
    PERFORM check_rota_pattern_compliance();
    RETURN NEW;
END;
$function$;

-- Add trigger on attendance table updates (drop if exists first)
DROP TRIGGER IF EXISTS attendance_rota_compliance_check ON attendance;
CREATE TRIGGER attendance_rota_compliance_check
    AFTER INSERT OR UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION trigger_rota_compliance_check();