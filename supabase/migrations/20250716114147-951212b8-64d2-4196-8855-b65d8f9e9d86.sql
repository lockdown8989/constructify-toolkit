-- Create function to send notifications to managers when employees don't clock in/out
CREATE OR REPLACE FUNCTION public.send_due_shift_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    notification_record record;
    employee_name text;
    employee_user_id uuid;
BEGIN
    -- Get due shift notifications (10 minutes before start time)
    FOR notification_record IN 
        SELECT sn.*, e.name as emp_name, e.user_id
        FROM shift_notifications sn
        JOIN employees e ON e.id = sn.employee_id
        WHERE sn.sent = false 
        AND sn.notification_time <= NOW()
        AND sn.notification_type = 'shift_start_reminder'
    LOOP
        -- Send notification to employee about upcoming shift
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            related_entity,
            related_id
        ) VALUES (
            notification_record.user_id,
            '🔔 Shift Starting Soon',
            'Your shift starts in 10 minutes at ' || 
            to_char(notification_record.shift_start_time, 'HH24:MI') || 
            '. Please prepare to clock in.',
            'info',
            'shift_notifications',
            notification_record.id
        );
        
        -- Mark notification as sent
        UPDATE shift_notifications 
        SET sent = true, sent_at = NOW()
        WHERE id = notification_record.id;
    END LOOP;
    
    -- Get due shift end notifications
    FOR notification_record IN 
        SELECT sn.*, e.name as emp_name, e.user_id
        FROM shift_notifications sn
        JOIN employees e ON e.id = sn.employee_id
        WHERE sn.sent = false 
        AND sn.notification_time <= NOW()
        AND sn.notification_type = 'shift_end_reminder'
    LOOP
        -- Send notification to employee about shift ending
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            related_entity,
            related_id
        ) VALUES (
            notification_record.user_id,
            '🔔 Time to Clock Out',
            'Your shift is ending soon. Please clock out at ' || 
            to_char(notification_record.shift_end_time, 'HH24:MI') || 
            ' or stay for approved overtime.',
            'warning',
            'shift_notifications',
            notification_record.id
        );
        
        -- Mark notification as sent
        UPDATE shift_notifications 
        SET sent = true, sent_at = NOW()
        WHERE id = notification_record.id;
    END LOOP;
END;
$function$;

-- Create function to check for late clock-ins and missing clock-outs
CREATE OR REPLACE FUNCTION public.check_attendance_violations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    employee_record record;
    current_time_var time;
    grace_period_minutes integer := 15; -- 15 minute grace period
BEGIN
    current_time_var := NOW()::time;
    
    -- Check for employees who should have clocked in but haven't (late)
    FOR employee_record IN
        SELECT e.id, e.name, e.user_id,
               CASE EXTRACT(DOW FROM CURRENT_DATE)
                   WHEN 0 THEN e.sunday_start_time
                   WHEN 1 THEN e.monday_start_time
                   WHEN 2 THEN e.tuesday_start_time
                   WHEN 3 THEN e.wednesday_start_time
                   WHEN 4 THEN e.thursday_start_time
                   WHEN 5 THEN e.friday_start_time
                   WHEN 6 THEN e.saturday_start_time
               END as scheduled_start,
               CASE EXTRACT(DOW FROM CURRENT_DATE)
                   WHEN 0 THEN e.sunday_available
                   WHEN 1 THEN e.monday_available
                   WHEN 2 THEN e.tuesday_available
                   WHEN 3 THEN e.wednesday_available
                   WHEN 4 THEN e.thursday_available
                   WHEN 5 THEN e.friday_available
                   WHEN 6 THEN e.saturday_available
               END as is_scheduled
        FROM employees e
        WHERE e.status = 'Active'
    LOOP
        -- Only check employees who are scheduled to work today
        IF employee_record.is_scheduled AND employee_record.scheduled_start IS NOT NULL THEN
            -- Check if they're late (past grace period)
            IF current_time_var > (employee_record.scheduled_start + (grace_period_minutes || ' minutes')::interval) THEN
                -- Check if they haven't clocked in yet today
                IF NOT EXISTS (
                    SELECT 1 FROM attendance 
                    WHERE employee_id = employee_record.id 
                    AND date = CURRENT_DATE 
                    AND check_in IS NOT NULL
                ) THEN
                    -- Notify managers about late employee
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
                        '⚠️ Employee Late',
                        employee_record.name || ' has not clocked in yet. Scheduled start time was ' ||
                        to_char(employee_record.scheduled_start, 'HH24:MI') || '.',
                        'warning',
                        'attendance',
                        employee_record.id
                    FROM user_roles ur
                    WHERE ur.role IN ('employer', 'admin', 'hr', 'manager');
                END IF;
            END IF;
        END IF;
    END LOOP;
    
    -- Check for employees who should have clocked out but haven't
    FOR employee_record IN
        SELECT e.id, e.name, e.user_id, a.id as attendance_id,
               CASE EXTRACT(DOW FROM CURRENT_DATE)
                   WHEN 0 THEN e.sunday_end_time
                   WHEN 1 THEN e.monday_end_time
                   WHEN 2 THEN e.tuesday_end_time
                   WHEN 3 THEN e.wednesday_end_time
                   WHEN 4 THEN e.thursday_end_time
                   WHEN 5 THEN e.friday_end_time
                   WHEN 6 THEN e.saturday_end_time
               END as scheduled_end,
               a.check_in
        FROM employees e
        JOIN attendance a ON a.employee_id = e.id
        WHERE e.status = 'Active'
        AND a.date = CURRENT_DATE
        AND a.active_session = true
        AND a.check_out IS NULL
    LOOP
        -- Check if they should have clocked out (past end time + grace period)
        IF employee_record.scheduled_end IS NOT NULL AND 
           current_time_var > (employee_record.scheduled_end + (grace_period_minutes || ' minutes')::interval) THEN
            
            -- Calculate overtime minutes
            UPDATE attendance 
            SET overtime_minutes = EXTRACT(EPOCH FROM (
                current_time_var - employee_record.scheduled_end
            ))/60,
            overtime_status = 'pending'
            WHERE id = employee_record.attendance_id;
            
            -- Notify managers about missing clock-out and overtime
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
                '🕐 Missing Clock Out - Overtime',
                employee_record.name || ' has not clocked out yet. Scheduled end time was ' ||
                to_char(employee_record.scheduled_end, 'HH24:MI') || '. They are currently in overtime and require approval.',
                'warning',
                'attendance',
                employee_record.attendance_id
            FROM user_roles ur
            WHERE ur.role IN ('employer', 'admin', 'hr', 'manager');
        END IF;
    END LOOP;
END;
$function$;

-- Create function to approve/reject overtime
CREATE OR REPLACE FUNCTION public.approve_overtime(
    p_attendance_id uuid,
    p_approved boolean,
    p_manager_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    employee_name text;
    employee_user_id uuid;
    overtime_minutes integer;
BEGIN
    -- Get attendance and employee details
    SELECT e.name, e.user_id, a.overtime_minutes
    INTO employee_name, employee_user_id, overtime_minutes
    FROM attendance a
    JOIN employees e ON e.id = a.employee_id
    WHERE a.id = p_attendance_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Update overtime status
    UPDATE attendance
    SET 
        overtime_status = CASE WHEN p_approved THEN 'approved' ELSE 'rejected' END,
        overtime_approved_by = auth.uid(),
        overtime_approved_at = NOW(),
        notes = COALESCE(notes || ' | ', '') || COALESCE(p_manager_notes, '')
    WHERE id = p_attendance_id;
    
    -- Notify employee about overtime decision
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        related_entity,
        related_id
    ) VALUES (
        employee_user_id,
        CASE WHEN p_approved THEN '✅ Overtime Approved' ELSE '❌ Overtime Rejected' END,
        CASE WHEN p_approved 
            THEN 'Your overtime of ' || overtime_minutes || ' minutes has been approved.'
            ELSE 'Your overtime of ' || overtime_minutes || ' minutes has been rejected.' END ||
        CASE WHEN p_manager_notes IS NOT NULL 
            THEN ' Note: ' || p_manager_notes 
            ELSE '' END,
        CASE WHEN p_approved THEN 'success' ELSE 'warning' END,
        'attendance',
        p_attendance_id
    );
    
    RETURN true;
END;
$function$;