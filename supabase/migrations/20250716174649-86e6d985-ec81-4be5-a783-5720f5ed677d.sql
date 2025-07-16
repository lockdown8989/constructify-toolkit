-- Create rota notification system
CREATE OR REPLACE FUNCTION notify_employees_rota_published(p_shift_template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    template_record record;
    assignment_record record;
    notification_title text;
    notification_message text;
BEGIN
    -- Get the shift template details
    SELECT * INTO template_record
    FROM shift_templates
    WHERE id = p_shift_template_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Shift template not found: %', p_shift_template_id;
    END IF;
    
    -- Build notification content
    notification_title := '🔔 New Rota Published';
    notification_message := 'A new rota "' || template_record.name || '" has been published. ' ||
                           'Schedule: ' || to_char(template_record.start_time, 'HH24:MI') || 
                           ' - ' || to_char(template_record.end_time, 'HH24:MI') || '. ' ||
                           'Please check your schedule and ensure you clock in and out according to your assigned rota times.';
    
    -- Notify all employees assigned to this rota pattern
    FOR assignment_record IN
        SELECT sta.employee_id, e.user_id, e.name
        FROM shift_template_assignments sta
        JOIN employees e ON e.id = sta.employee_id
        WHERE sta.shift_template_id = p_shift_template_id
        AND sta.is_active = true
        AND e.user_id IS NOT NULL
    LOOP
        -- Insert notification for each assigned employee
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            related_entity,
            related_id,
            read
        ) VALUES (
            assignment_record.user_id,
            notification_title,
            notification_message,
            'info',
            'shift_template',
            p_shift_template_id,
            false
        );
        
        RAISE NOTICE 'Rota notification sent to employee: % (ID: %)', assignment_record.name, assignment_record.employee_id;
    END LOOP;
    
    RAISE NOTICE 'Rota publication notifications completed for template: %', template_record.name;
END;
$$;

-- Create function to get employee's current rota shift times for today
CREATE OR REPLACE FUNCTION get_employee_rota_shift_times(p_employee_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    shift_template_id UUID,
    template_name TEXT,
    start_time TIME,
    end_time TIME,
    break_duration INTEGER,
    grace_period_minutes INTEGER,
    overtime_threshold_minutes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    day_of_week INTEGER;
BEGIN
    -- Get the day of week (0=Sunday, 1=Monday, etc.)
    day_of_week := EXTRACT(DOW FROM p_date);
    
    -- Find active rota assignments for this employee and day
    RETURN QUERY
    SELECT 
        st.id,
        st.name,
        st.start_time,
        st.end_time,
        COALESCE(st.break_duration, 30),
        COALESCE(st.grace_period_minutes, 15),
        COALESCE(st.overtime_threshold_minutes, 30)
    FROM shift_template_assignments sta
    JOIN shift_templates st ON st.id = sta.shift_template_id
    WHERE sta.employee_id = p_employee_id
    AND sta.is_active = true
    AND day_of_week = ANY(st.days_of_week)
    ORDER BY sta.assigned_at DESC
    LIMIT 1;
END;
$$;

-- Create function to validate rota compliance for clock in/out
CREATE OR REPLACE FUNCTION validate_rota_compliance(
    p_employee_id UUID,
    p_action_type TEXT, -- 'clock_in' or 'clock_out'
    p_action_time TIMESTAMP DEFAULT NOW()
)
RETURNS TABLE(
    is_compliant BOOLEAN,
    message TEXT,
    scheduled_time TIME,
    actual_time TIME,
    minutes_difference INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    rota_shift RECORD;
    action_date DATE;
    action_time_only TIME;
    minutes_diff INTEGER;
    grace_period INTEGER;
    result_message TEXT;
    is_valid BOOLEAN := true;
BEGIN
    action_date := p_action_time::DATE;
    action_time_only := p_action_time::TIME;
    
    -- Get the employee's rota shift for today
    SELECT * INTO rota_shift
    FROM get_employee_rota_shift_times(p_employee_id, action_date)
    LIMIT 1;
    
    -- If no rota shift found, allow but note it
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            true,
            'No rota shift scheduled for today - using standard attendance tracking',
            null::TIME,
            action_time_only,
            0;
        RETURN;
    END IF;
    
    -- Validate based on action type
    IF p_action_type = 'clock_in' THEN
        minutes_diff := EXTRACT(EPOCH FROM (action_time_only - rota_shift.start_time))/60;
        grace_period := COALESCE(rota_shift.grace_period_minutes, 15);
        
        IF minutes_diff > grace_period THEN
            is_valid := false;
            result_message := 'Late clock-in: ' || ABS(minutes_diff) || ' minutes after scheduled start time';
        ELSIF minutes_diff < -grace_period THEN
            result_message := 'Early clock-in: ' || ABS(minutes_diff) || ' minutes before scheduled start time';
        ELSE
            result_message := 'On-time clock-in according to rota schedule';
        END IF;
        
        RETURN QUERY SELECT 
            is_valid,
            result_message,
            rota_shift.start_time,
            action_time_only,
            minutes_diff::INTEGER;
            
    ELSIF p_action_type = 'clock_out' THEN
        minutes_diff := EXTRACT(EPOCH FROM (action_time_only - rota_shift.end_time))/60;
        
        IF minutes_diff < -15 THEN -- Early departure by more than 15 minutes
            is_valid := false;
            result_message := 'Early departure: ' || ABS(minutes_diff) || ' minutes before scheduled end time';
        ELSIF minutes_diff > (COALESCE(rota_shift.overtime_threshold_minutes, 30)) THEN
            result_message := 'Overtime: ' || minutes_diff || ' minutes beyond scheduled end time - requires approval';
        ELSE
            result_message := 'On-time clock-out according to rota schedule';
        END IF;
        
        RETURN QUERY SELECT 
            true, -- Don't block clock-out, just record the variance
            result_message,
            rota_shift.end_time,
            action_time_only,
            minutes_diff::INTEGER;
    END IF;
END;
$$;