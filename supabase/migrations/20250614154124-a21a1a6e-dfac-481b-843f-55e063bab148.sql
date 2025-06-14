
-- Create shift patterns table to store different shift types
CREATE TABLE public.shift_patterns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL, -- e.g., "Morning Shift", "Afternoon Shift", "Night Shift"
  start_time time NOT NULL,
  end_time time NOT NULL,
  break_duration integer NOT NULL DEFAULT 30, -- in minutes
  grace_period_minutes integer NOT NULL DEFAULT 15, -- grace period for late arrivals
  overtime_threshold_minutes integer NOT NULL DEFAULT 15, -- minimum minutes to count as overtime
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add shift_pattern_id to employees table
ALTER TABLE public.employees 
ADD COLUMN shift_pattern_id uuid REFERENCES public.shift_patterns(id),
ADD COLUMN monday_shift_id uuid REFERENCES public.shift_patterns(id),
ADD COLUMN tuesday_shift_id uuid REFERENCES public.shift_patterns(id),
ADD COLUMN wednesday_shift_id uuid REFERENCES public.shift_patterns(id),
ADD COLUMN thursday_shift_id uuid REFERENCES public.shift_patterns(id),
ADD COLUMN friday_shift_id uuid REFERENCES public.shift_patterns(id),
ADD COLUMN saturday_shift_id uuid REFERENCES public.shift_patterns(id),
ADD COLUMN sunday_shift_id uuid REFERENCES public.shift_patterns(id);

-- Add attendance tracking fields
ALTER TABLE public.attendance
ADD COLUMN scheduled_start_time time,
ADD COLUMN scheduled_end_time time,
ADD COLUMN late_minutes integer DEFAULT 0,
ADD COLUMN early_departure_minutes integer DEFAULT 0,
ADD COLUMN is_late boolean DEFAULT false,
ADD COLUMN is_early_departure boolean DEFAULT false,
ADD COLUMN shift_pattern_id uuid REFERENCES public.shift_patterns(id);

-- Insert default shift patterns
INSERT INTO public.shift_patterns (name, start_time, end_time, break_duration, grace_period_minutes, overtime_threshold_minutes) VALUES
('Morning Shift', '06:00:00', '14:00:00', 30, 15, 15),
('Afternoon Shift', '14:00:00', '22:00:00', 30, 15, 15),
('Night Shift', '22:00:00', '06:00:00', 30, 15, 15),
('Standard Day Shift', '09:00:00', '17:00:00', 60, 15, 15);

-- Create function to calculate attendance metrics
CREATE OR REPLACE FUNCTION public.calculate_attendance_metrics(
  p_attendance_id uuid,
  p_employee_id uuid,
  p_check_in_time timestamp without time zone,
  p_check_out_time timestamp without time zone DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  shift_pattern record;
  check_in_date date;
  day_of_week integer;
  scheduled_start timestamp without time zone;
  scheduled_end timestamp without time zone;
  late_mins integer := 0;
  early_mins integer := 0;
  working_mins integer := 0;
  overtime_mins integer := 0;
  shift_pattern_id_to_use uuid;
BEGIN
  -- Get the date and day of week from check-in time
  check_in_date := p_check_in_time::date;
  day_of_week := EXTRACT(DOW FROM check_in_date); -- 0=Sunday, 1=Monday, etc.
  
  -- Get the appropriate shift pattern for the day
  SELECT 
    CASE day_of_week
      WHEN 0 THEN e.sunday_shift_id
      WHEN 1 THEN e.monday_shift_id
      WHEN 2 THEN e.tuesday_shift_id
      WHEN 3 THEN e.wednesday_shift_id
      WHEN 4 THEN e.thursday_shift_id
      WHEN 5 THEN e.friday_shift_id
      WHEN 6 THEN e.saturday_shift_id
    END
  INTO shift_pattern_id_to_use
  FROM employees e
  WHERE e.id = p_employee_id;
  
  -- Fallback to default shift pattern if no specific day pattern
  IF shift_pattern_id_to_use IS NULL THEN
    SELECT shift_pattern_id INTO shift_pattern_id_to_use
    FROM employees 
    WHERE id = p_employee_id;
  END IF;
  
  -- Get shift pattern details
  SELECT * INTO shift_pattern
  FROM shift_patterns
  WHERE id = shift_pattern_id_to_use;
  
  IF shift_pattern IS NOT NULL THEN
    -- Calculate scheduled start and end times
    scheduled_start := check_in_date + shift_pattern.start_time;
    
    -- Handle night shifts that cross midnight
    IF shift_pattern.end_time < shift_pattern.start_time THEN
      scheduled_end := (check_in_date + interval '1 day') + shift_pattern.end_time;
    ELSE
      scheduled_end := check_in_date + shift_pattern.end_time;
    END IF;
    
    -- Calculate late minutes
    IF p_check_in_time > (scheduled_start + (shift_pattern.grace_period_minutes || ' minutes')::interval) THEN
      late_mins := EXTRACT(EPOCH FROM (p_check_in_time - scheduled_start))/60;
    END IF;
    
    -- Calculate early departure and working time if checked out
    IF p_check_out_time IS NOT NULL THEN
      IF p_check_out_time < scheduled_end THEN
        early_mins := EXTRACT(EPOCH FROM (scheduled_end - p_check_out_time))/60;
      END IF;
      
      -- Calculate working minutes
      working_mins := EXTRACT(EPOCH FROM (p_check_out_time - p_check_in_time))/60;
      
      -- Calculate overtime (time beyond scheduled end + threshold)
      IF p_check_out_time > (scheduled_end + (shift_pattern.overtime_threshold_minutes || ' minutes')::interval) THEN
        overtime_mins := EXTRACT(EPOCH FROM (p_check_out_time - scheduled_end))/60;
      END IF;
    END IF;
    
    -- Update attendance record
    UPDATE attendance SET
      scheduled_start_time = shift_pattern.start_time,
      scheduled_end_time = shift_pattern.end_time,
      late_minutes = late_mins,
      early_departure_minutes = early_mins,
      is_late = (late_mins > 0),
      is_early_departure = (early_mins > 0),
      working_minutes = CASE WHEN p_check_out_time IS NOT NULL THEN working_mins ELSE working_minutes END,
      overtime_minutes = CASE WHEN p_check_out_time IS NOT NULL THEN overtime_mins ELSE overtime_minutes END,
      shift_pattern_id = shift_pattern_id_to_use
    WHERE id = p_attendance_id;
  END IF;
END;
$function$;

-- Create trigger to automatically calculate metrics on attendance updates
CREATE OR REPLACE FUNCTION public.trigger_calculate_attendance_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Calculate metrics when check_in is set
  IF NEW.check_in IS NOT NULL AND (OLD.check_in IS NULL OR OLD.check_in IS DISTINCT FROM NEW.check_in) THEN
    PERFORM calculate_attendance_metrics(NEW.id, NEW.employee_id, NEW.check_in, NEW.check_out);
  END IF;
  
  -- Recalculate when check_out is set
  IF NEW.check_out IS NOT NULL AND (OLD.check_out IS NULL OR OLD.check_out IS DISTINCT FROM NEW.check_out) THEN
    PERFORM calculate_attendance_metrics(NEW.id, NEW.employee_id, NEW.check_in, NEW.check_out);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS attendance_metrics_trigger ON public.attendance;
CREATE TRIGGER attendance_metrics_trigger
  AFTER INSERT OR UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_attendance_metrics();

-- Enable RLS on shift_patterns table
ALTER TABLE public.shift_patterns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shift_patterns
CREATE POLICY "Allow all authenticated users to view shift patterns"
  ON public.shift_patterns
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow managers to manage shift patterns"
  ON public.shift_patterns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'employer', 'hr')
    )
  );
