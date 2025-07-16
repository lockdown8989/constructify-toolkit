-- Remove shift pattern system since rota shift system is being used instead

-- First, remove foreign key constraints and references
ALTER TABLE public.employees 
DROP CONSTRAINT IF EXISTS fk_employees_shift_pattern,
DROP CONSTRAINT IF EXISTS fk_employees_monday_shift,
DROP CONSTRAINT IF EXISTS fk_employees_tuesday_shift,
DROP CONSTRAINT IF EXISTS fk_employees_wednesday_shift,
DROP CONSTRAINT IF EXISTS fk_employees_thursday_shift,
DROP CONSTRAINT IF EXISTS fk_employees_friday_shift,
DROP CONSTRAINT IF EXISTS fk_employees_saturday_shift,
DROP CONSTRAINT IF EXISTS fk_employees_sunday_shift,
DROP CONSTRAINT IF EXISTS employees_shift_pattern_id_fkey,
DROP CONSTRAINT IF EXISTS employees_monday_shift_id_fkey,
DROP CONSTRAINT IF EXISTS employees_tuesday_shift_id_fkey,
DROP CONSTRAINT IF EXISTS employees_wednesday_shift_id_fkey,
DROP CONSTRAINT IF EXISTS employees_thursday_shift_id_fkey,
DROP CONSTRAINT IF EXISTS employees_friday_shift_id_fkey,
DROP CONSTRAINT IF EXISTS employees_saturday_shift_id_fkey,
DROP CONSTRAINT IF EXISTS employees_sunday_shift_id_fkey;

-- Remove shift pattern references from attendance table
ALTER TABLE public.attendance 
DROP CONSTRAINT IF EXISTS fk_attendance_shift_pattern,
DROP CONSTRAINT IF EXISTS attendance_shift_pattern_id_fkey;

-- Remove shift pattern columns from employees table
ALTER TABLE public.employees 
DROP COLUMN IF EXISTS shift_pattern_id,
DROP COLUMN IF EXISTS monday_shift_id,
DROP COLUMN IF EXISTS tuesday_shift_id,
DROP COLUMN IF EXISTS wednesday_shift_id,
DROP COLUMN IF EXISTS thursday_shift_id,
DROP COLUMN IF EXISTS friday_shift_id,
DROP COLUMN IF EXISTS saturday_shift_id,
DROP COLUMN IF EXISTS sunday_shift_id;

-- Remove shift pattern reference from attendance table
ALTER TABLE public.attendance 
DROP COLUMN IF EXISTS shift_pattern_id;

-- Drop shift pattern related tables
DROP TABLE IF EXISTS public.shift_pattern_assignments;
DROP TABLE IF EXISTS public.shift_patterns;

-- Remove shift pattern related indexes
DROP INDEX IF EXISTS idx_employees_shift_pattern_id;
DROP INDEX IF EXISTS idx_employees_monday_shift_id;
DROP INDEX IF EXISTS idx_employees_tuesday_shift_id;
DROP INDEX IF EXISTS idx_employees_wednesday_shift_id;
DROP INDEX IF EXISTS idx_employees_thursday_shift_id;
DROP INDEX IF EXISTS idx_employees_friday_shift_id;
DROP INDEX IF EXISTS idx_employees_saturday_shift_id;
DROP INDEX IF EXISTS idx_employees_sunday_shift_id;
DROP INDEX IF EXISTS idx_attendance_shift_pattern_id;

-- Update the calculate_attendance_metrics function to remove shift pattern dependencies
CREATE OR REPLACE FUNCTION public.calculate_attendance_metrics(
  p_attendance_id uuid, 
  p_employee_id uuid, 
  p_check_in_time timestamp without time zone, 
  p_check_out_time timestamp without time zone DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  check_in_date date;
  day_of_week integer;
  scheduled_start timestamp without time zone;
  scheduled_end timestamp without time zone;
  late_mins integer := 0;
  early_mins integer := 0;
  working_mins integer := 0;
  overtime_mins integer := 0;
  start_time time;
  end_time time;
BEGIN
  -- Get the date and day of week from check-in time
  check_in_date := p_check_in_time::date;
  day_of_week := EXTRACT(DOW FROM check_in_date); -- 0=Sunday, 1=Monday, etc.
  
  -- Get employee's scheduled times for the day (using existing availability columns)
  SELECT 
    CASE day_of_week
      WHEN 0 THEN e.sunday_start_time
      WHEN 1 THEN e.monday_start_time
      WHEN 2 THEN e.tuesday_start_time
      WHEN 3 THEN e.wednesday_start_time
      WHEN 4 THEN e.thursday_start_time
      WHEN 5 THEN e.friday_start_time
      WHEN 6 THEN e.saturday_start_time
    END,
    CASE day_of_week
      WHEN 0 THEN e.sunday_end_time
      WHEN 1 THEN e.monday_end_time
      WHEN 2 THEN e.tuesday_end_time
      WHEN 3 THEN e.wednesday_end_time
      WHEN 4 THEN e.thursday_end_time
      WHEN 5 THEN e.friday_end_time
      WHEN 6 THEN e.saturday_end_time
    END
  INTO start_time, end_time
  FROM employees e
  WHERE e.id = p_employee_id;
  
  IF start_time IS NOT NULL AND end_time IS NOT NULL THEN
    -- Calculate scheduled start and end times
    scheduled_start := check_in_date + start_time;
    
    -- Handle night shifts that cross midnight
    IF end_time < start_time THEN
      scheduled_end := (check_in_date + interval '1 day') + end_time;
    ELSE
      scheduled_end := check_in_date + end_time;
    END IF;
    
    -- Calculate late minutes (using 15 minute grace period)
    IF p_check_in_time > (scheduled_start + interval '15 minutes') THEN
      late_mins := EXTRACT(EPOCH FROM (p_check_in_time - scheduled_start))/60;
    END IF;
    
    -- Calculate early departure and working time if checked out
    IF p_check_out_time IS NOT NULL THEN
      IF p_check_out_time < scheduled_end THEN
        early_mins := EXTRACT(EPOCH FROM (scheduled_end - p_check_out_time))/60;
      END IF;
      
      -- Calculate working minutes
      working_mins := EXTRACT(EPOCH FROM (p_check_out_time - p_check_in_time))/60;
      
      -- Calculate overtime (time beyond scheduled end + 30 minute threshold)
      IF p_check_out_time > (scheduled_end + interval '30 minutes') THEN
        overtime_mins := EXTRACT(EPOCH FROM (p_check_out_time - scheduled_end))/60;
      END IF;
    END IF;
    
    -- Update attendance record
    UPDATE attendance SET
      scheduled_start_time = start_time,
      scheduled_end_time = end_time,
      late_minutes = late_mins,
      early_departure_minutes = early_mins,
      is_late = (late_mins > 0),
      is_early_departure = (early_mins > 0),
      working_minutes = CASE WHEN p_check_out_time IS NOT NULL THEN working_mins ELSE working_minutes END,
      overtime_minutes = CASE WHEN p_check_out_time IS NOT NULL THEN overtime_mins ELSE overtime_minutes END
    WHERE id = p_attendance_id;
  END IF;
END;
$$;