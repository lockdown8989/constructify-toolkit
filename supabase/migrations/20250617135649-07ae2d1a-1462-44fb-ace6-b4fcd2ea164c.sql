
-- Safer migration that checks for existing constraints before creating them

-- Create indexes for better performance on shift assignments (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_employees_shift_pattern_id ON public.employees(shift_pattern_id);
CREATE INDEX IF NOT EXISTS idx_employees_monday_shift_id ON public.employees(monday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_tuesday_shift_id ON public.employees(tuesday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_wednesday_shift_id ON public.employees(wednesday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_thursday_shift_id ON public.employees(thursday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_friday_shift_id ON public.employees(friday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_saturday_shift_id ON public.employees(saturday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_sunday_shift_id ON public.employees(sunday_shift_id);

-- Update RLS policies to be more permissive for authenticated users viewing employee data
DROP POLICY IF EXISTS "Allow all authenticated users to view employees" ON public.employees;
DROP POLICY IF EXISTS "Allow authenticated users to view employees" ON public.employees;

CREATE POLICY "Allow authenticated users to view employees"
ON public.employees
FOR SELECT
TO authenticated
USING (true);

-- Create a more comprehensive function to safely update employee shift assignments
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
    -- Validate that employee exists and user has permission
    IF NOT EXISTS (
        SELECT 1 FROM employees e
        WHERE e.id = p_employee_id
        AND (
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'employer', 'hr')
            )
            OR e.user_id = auth.uid()
        )
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Employee not found or access denied');
    END IF;

    -- Update the employee's shift assignments
    UPDATE employees SET
        shift_pattern_id = CASE WHEN p_shift_pattern_id = '' THEN NULL ELSE p_shift_pattern_id END,
        monday_shift_id = CASE WHEN p_monday_shift_id = '' THEN NULL ELSE p_monday_shift_id END,
        tuesday_shift_id = CASE WHEN p_tuesday_shift_id = '' THEN NULL ELSE p_tuesday_shift_id END,
        wednesday_shift_id = CASE WHEN p_wednesday_shift_id = '' THEN NULL ELSE p_wednesday_shift_id END,
        thursday_shift_id = CASE WHEN p_thursday_shift_id = '' THEN NULL ELSE p_thursday_shift_id END,
        friday_shift_id = CASE WHEN p_friday_shift_id = '' THEN NULL ELSE p_friday_shift_id END,
        saturday_shift_id = CASE WHEN p_saturday_shift_id = '' THEN NULL ELSE p_saturday_shift_id END,
        sunday_shift_id = CASE WHEN p_sunday_shift_id = '' THEN NULL ELSE p_sunday_shift_id END
    WHERE id = p_employee_id;

    RETURN json_build_object('success', true, 'message', 'Shift assignments updated successfully');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- Ensure shift_patterns table has proper RLS policies
ALTER TABLE public.shift_patterns ENABLE ROW LEVEL SECURITY;

-- Drop and recreate shift_patterns policies to ensure they're correct
DROP POLICY IF EXISTS "Allow all authenticated users to view shift patterns" ON public.shift_patterns;
DROP POLICY IF EXISTS "Allow authenticated users to view shift patterns" ON public.shift_patterns;
DROP POLICY IF EXISTS "Allow managers to manage shift patterns" ON public.shift_patterns;

CREATE POLICY "Allow authenticated users to view shift patterns"
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
