-- Create function to update attendance statuses based on rota patterns
CREATE OR REPLACE FUNCTION public.update_rota_attendance_statuses(p_date date DEFAULT CURRENT_DATE)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sched record;
  rota record;
  att record;
  now_time time := now()::time;
  grace_minutes integer;
  present_count int := 0;
  late_count int := 0;
  pending_count int := 0;
  absent_count int := 0;
  completed_count int := 0;
  incomplete_count int := 0;
BEGIN
  -- Iterate confirmed rota schedules for the specified date
  FOR sched IN
    SELECT s.id, s.employee_id, s.start_time, s.end_time
    FROM schedules s
    WHERE s.template_id IS NOT NULL
      AND DATE(s.start_time) = p_date
      AND s.status IN ('confirmed','employee_accepted')
  LOOP
    -- Get the employee rota times for the date
    SELECT * INTO rota 
    FROM get_employee_rota_shift_times(sched.employee_id, p_date)
    LIMIT 1;

    -- Default grace period if none defined
    grace_minutes := COALESCE(rota.grace_period_minutes, 15);

    -- Fetch any existing attendance record for the employee/date
    SELECT * INTO att 
    FROM attendance 
    WHERE employee_id = sched.employee_id 
      AND date = p_date
    LIMIT 1;

    IF att IS NULL THEN
      -- No record yet: set Pending before grace window, otherwise mark Absent/Incomplete
      IF rota.start_time IS NOT NULL 
         AND now_time <= (rota.start_time + (grace_minutes || ' minutes')::interval)::time THEN
        INSERT INTO attendance (
          employee_id, date, status, attendance_status, 
          scheduled_start_time, scheduled_end_time, current_status, active_session
        ) VALUES (
          sched.employee_id, p_date, 'Scheduled', 'Pending',
          rota.start_time, rota.end_time, 'clocked-out', false
        )
        ON CONFLICT (employee_id, date) DO NOTHING;
        pending_count := pending_count + 1;
      ELSE
        INSERT INTO attendance (
          employee_id, date, status, attendance_status, notes, 
          scheduled_start_time, scheduled_end_time, current_status, active_session
        ) VALUES (
          sched.employee_id, p_date, 'Incomplete', 'Absent', 'Missed clock-in according to rota pattern',
          rota.start_time, rota.end_time, 'clocked-out', false
        )
        ON CONFLICT (employee_id, date) DO UPDATE SET
          status = 'Incomplete',
          attendance_status = 'Absent',
          notes = COALESCE(attendance.notes, '') || ' | Missed clock-in according to rota pattern',
          scheduled_start_time = EXCLUDED.scheduled_start_time,
          scheduled_end_time = EXCLUDED.scheduled_end_time;
        absent_count := absent_count + 1;
      END IF;
    ELSE
      -- Have a record for the day
      IF att.check_in IS NOT NULL THEN
        IF rota.start_time IS NOT NULL THEN
          IF (att.check_in::time - rota.start_time) > (grace_minutes || ' minutes')::interval THEN
            UPDATE attendance SET
              attendance_status = 'Late',
              is_late = true,
              late_minutes = EXTRACT(EPOCH FROM (att.check_in::time - rota.start_time))/60,
              scheduled_start_time = rota.start_time,
              scheduled_end_time = rota.end_time
            WHERE id = att.id;
            late_count := late_count + 1;
          ELSE
            UPDATE attendance SET
              attendance_status = 'Present',
              is_late = false,
              late_minutes = 0,
              scheduled_start_time = rota.start_time,
              scheduled_end_time = rota.end_time
            WHERE id = att.id;
            present_count := present_count + 1;
          END IF;
        END IF;
      ELSE
        -- No check-in yet
        IF rota.start_time IS NOT NULL 
           AND now_time <= (rota.start_time + (grace_minutes || ' minutes')::interval)::time THEN
          UPDATE attendance SET 
            attendance_status = 'Pending', 
            status = 'Scheduled',
            scheduled_start_time = rota.start_time,
            scheduled_end_time = rota.end_time
          WHERE id = att.id;
          pending_count := pending_count + 1;
        ELSE
          UPDATE attendance SET 
            attendance_status = 'Absent', 
            status = 'Incomplete',
            scheduled_start_time = rota.start_time,
            scheduled_end_time = rota.end_time
          WHERE id = att.id;
          absent_count := absent_count + 1;
        END IF;
      END IF;

      -- Completion vs. incomplete
      IF att.check_out IS NOT NULL THEN
        UPDATE attendance SET 
          status = 'Completed', 
          current_status = 'clocked-out', 
          active_session = false
        WHERE id = att.id;
        completed_count := completed_count + 1;
      ELSE
        IF rota.end_time IS NOT NULL 
           AND now_time > (rota.end_time + (grace_minutes || ' minutes')::interval)::time THEN
          UPDATE attendance SET status = 'Incomplete' WHERE id = att.id;
          incomplete_count := incomplete_count + 1;
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'date', p_date,
    'present', present_count,
    'late', late_count,
    'pending', pending_count,
    'absent', absent_count,
    'completed', completed_count,
    'incomplete', incomplete_count
  );
END;
$$;