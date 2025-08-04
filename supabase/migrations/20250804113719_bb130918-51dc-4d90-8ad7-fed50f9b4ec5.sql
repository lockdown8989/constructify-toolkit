-- Fix ambiguous foreign key relationships between schedules and employees tables
-- This prevents PGRST201 errors when embedding employee data in schedule queries

-- First, let's check and potentially rename the foreign key constraints to be more explicit
-- This will help with query disambiguation

-- Add explicit naming to foreign key constraints if they exist
DO $$
BEGIN
  -- Check if the foreign key constraints exist and rename them for clarity
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'schedules_employee_id_fkey' 
             AND table_name = 'schedules') THEN
    ALTER TABLE schedules 
    RENAME CONSTRAINT schedules_employee_id_fkey 
    TO schedules_assigned_employee_fkey;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'schedules_manager_id_fkey' 
             AND table_name = 'schedules') THEN
    ALTER TABLE schedules 
    RENAME CONSTRAINT schedules_manager_id_fkey 
    TO schedules_manager_employee_fkey;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If constraints don't exist or can't be renamed, continue
    NULL;
END $$;

-- Create indexes to improve query performance for common lookups
CREATE INDEX IF NOT EXISTS idx_schedules_employee_id_date 
ON schedules(employee_id, start_time) 
WHERE employee_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_schedules_manager_id_date 
ON schedules(manager_id, start_time) 
WHERE manager_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_schedules_published_date 
ON schedules(published, start_time) 
WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_attendance_employee_date 
ON attendance(employee_id, date) 
WHERE employee_id IS NOT NULL;

-- Create a view to simplify schedule queries with employee data
CREATE OR REPLACE VIEW schedules_with_employee_details AS
SELECT 
  s.*,
  e.name as employee_name,
  e.email as employee_email,
  e.hourly_rate as employee_hourly_rate,
  e.department as employee_department,
  m.name as manager_name,
  m.email as manager_email
FROM schedules s
LEFT JOIN employees e ON e.id = s.employee_id
LEFT JOIN employees m ON m.id::uuid = s.manager_id::uuid;

-- Grant appropriate permissions
GRANT SELECT ON schedules_with_employee_details TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view schedule details based on schedule policies" 
ON schedules_with_employee_details FOR SELECT 
USING (
  -- Inherit the same access controls as the schedules table
  EXISTS (
    SELECT 1 FROM schedules 
    WHERE schedules.id = schedules_with_employee_details.id
  )
);