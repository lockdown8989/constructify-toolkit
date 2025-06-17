
-- Fix employee shift assignment relationships and add missing constraints

-- Ensure all foreign key constraints exist for shift patterns
DO $$ 
BEGIN
    -- Check if attendance table has shift_pattern_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_attendance_shift_pattern' 
        AND table_name = 'attendance'
    ) THEN
        ALTER TABLE public.attendance 
        ADD CONSTRAINT fk_attendance_shift_pattern 
        FOREIGN KEY (shift_pattern_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;

    -- Ensure all employee shift pattern foreign keys exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_employees_shift_pattern' 
        AND table_name = 'employees'
    ) THEN
        ALTER TABLE public.employees 
        ADD CONSTRAINT fk_employees_shift_pattern 
        FOREIGN KEY (shift_pattern_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;

    -- Add missing daily shift foreign keys if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_monday_shift') THEN
        ALTER TABLE public.employees ADD CONSTRAINT fk_employees_monday_shift 
        FOREIGN KEY (monday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_tuesday_shift') THEN
        ALTER TABLE public.employees ADD CONSTRAINT fk_employees_tuesday_shift 
        FOREIGN KEY (tuesday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_wednesday_shift') THEN
        ALTER TABLE public.employees ADD CONSTRAINT fk_employees_wednesday_shift 
        FOREIGN KEY (wednesday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_thursday_shift') THEN
        ALTER TABLE public.employees ADD CONSTRAINT fk_employees_thursday_shift 
        FOREIGN KEY (thursday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_friday_shift') THEN
        ALTER TABLE public.employees ADD CONSTRAINT fk_employees_friday_shift 
        FOREIGN KEY (friday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_saturday_shift') THEN
        ALTER TABLE public.employees ADD CONSTRAINT fk_employees_saturday_shift 
        FOREIGN KEY (saturday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_sunday_shift') THEN
        ALTER TABLE public.employees ADD CONSTRAINT fk_employees_sunday_shift 
        FOREIGN KEY (sunday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_employees_shift_pattern_id ON public.employees(shift_pattern_id);
CREATE INDEX IF NOT EXISTS idx_employees_monday_shift_id ON public.employees(monday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_tuesday_shift_id ON public.employees(tuesday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_wednesday_shift_id ON public.employees(wednesday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_thursday_shift_id ON public.employees(thursday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_friday_shift_id ON public.employees(friday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_saturday_shift_id ON public.employees(saturday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_sunday_shift_id ON public.employees(sunday_shift_id);
CREATE INDEX IF NOT EXISTS idx_attendance_shift_pattern_id ON public.attendance(shift_pattern_id);

-- Create a function to safely update employee shift assignments
CREATE OR REPLACE FUNCTION public.update_employee_shift_assignments(
    p_employee_id uuid,
    p_shift_pattern_id uuid DEFAULT NULL,
    p_monday_shift_id uuid DEFAULT NULL,
    p_tuesday_shift_id uuid DEFAULT NULL,
    p_wednesday_shift_id uuid DEFAULT NULL,
    p_thursday_shift_id uuid DEFAULT NULL,
    p_friday_shift_id uuid DEFAULT NULL,
    p_saturday_shift_id uuid DEFAULT NULL,
    p_sunday_shift_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Validate that employee exists
    IF NOT EXISTS (SELECT 1 FROM employees WHERE id = p_employee_id) THEN
        RETURN json_build_object('success', false, 'error', 'Employee not found');
    END IF;

    -- Update the employee's shift assignments
    UPDATE employees SET
        shift_pattern_id = p_shift_pattern_id,
        monday_shift_id = p_monday_shift_id,
        tuesday_shift_id = p_tuesday_shift_id,
        wednesday_shift_id = p_wednesday_shift_id,
        thursday_shift_id = p_thursday_shift_id,
        friday_shift_id = p_friday_shift_id,
        saturday_shift_id = p_saturday_shift_id,
        sunday_shift_id = p_sunday_shift_id
    WHERE id = p_employee_id;

    RETURN json_build_object('success', true, 'message', 'Shift assignments updated successfully');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- Enable RLS on shift_patterns if not already enabled
ALTER TABLE public.shift_patterns ENABLE ROW LEVEL SECURITY;

-- Create policies for shift patterns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'shift_patterns' 
        AND policyname = 'Allow all authenticated users to view shift patterns'
    ) THEN
        CREATE POLICY "Allow all authenticated users to view shift patterns"
        ON public.shift_patterns
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'shift_patterns' 
        AND policyname = 'Allow managers to manage shift patterns'
    ) THEN
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
    END IF;
END $$;
