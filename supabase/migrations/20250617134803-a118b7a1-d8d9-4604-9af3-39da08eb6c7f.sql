
-- Fix RLS policies and add missing constraints for employee shift assignments

-- Ensure RLS is properly configured for employees table
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them properly
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow all authenticated users to view employees" ON public.employees;
    DROP POLICY IF EXISTS "Allow managers to manage employees" ON public.employees;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create comprehensive RLS policies for employees table
CREATE POLICY "Allow all authenticated users to view employees"
ON public.employees
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow managers to manage employees"
ON public.employees
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'employer', 'hr')
    )
    OR user_id = auth.uid()
);

-- Ensure shift_patterns RLS policies exist
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

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);

-- Create a function to safely get employee shift assignments with proper error handling
CREATE OR REPLACE FUNCTION public.get_employee_shift_assignments(p_employee_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    result json;
BEGIN
    -- Validate that employee exists and user has permission to view
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

    -- Get employee shift assignments with null safety
    SELECT json_build_object(
        'success', true,
        'data', json_build_object(
            'employee_id', COALESCE(e.id::text, ''),
            'shift_pattern_id', COALESCE(e.shift_pattern_id::text, ''),
            'monday_shift_id', COALESCE(e.monday_shift_id::text, ''),
            'tuesday_shift_id', COALESCE(e.tuesday_shift_id::text, ''),
            'wednesday_shift_id', COALESCE(e.wednesday_shift_id::text, ''),
            'thursday_shift_id', COALESCE(e.thursday_shift_id::text, ''),
            'friday_shift_id', COALESCE(e.friday_shift_id::text, ''),
            'saturday_shift_id', COALESCE(e.saturday_shift_id::text, ''),
            'sunday_shift_id', COALESCE(e.sunday_shift_id::text, '')
        )
    )
    INTO result
    FROM employees e
    WHERE e.id = p_employee_id;

    RETURN COALESCE(result, json_build_object('success', false, 'error', 'No data found'));
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;
