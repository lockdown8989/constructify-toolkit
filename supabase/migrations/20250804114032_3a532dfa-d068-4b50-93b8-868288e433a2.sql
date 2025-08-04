-- Fix ambiguous foreign key relationships and improve query performance
-- This prevents PGRST201 errors when embedding employee data in schedule queries

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
-- This avoids the ambiguous foreign key relationship issues
CREATE OR REPLACE VIEW schedules_with_employee_details AS
SELECT 
  s.id,
  s.employee_id,
  s.manager_id,
  s.start_time,
  s.end_time,
  s.title,
  s.status,
  s.published,
  s.break_duration,
  s.hourly_rate,
  s.estimated_cost,
  s.created_at,
  s.updated_at,
  s.is_draft,
  s.can_be_edited,
  s.location,
  s.notes,
  s.template_id,
  s.shift_type,
  s.published_by,
  s.approved_by,
  s.last_dragged_by,
  s.color,
  s.published_at,
  e.name as employee_name,
  e.email as employee_email,
  e.hourly_rate as employee_hourly_rate,
  e.department as employee_department,
  e.job_title as employee_job_title,
  m.name as manager_name,
  m.email as manager_email
FROM schedules s
LEFT JOIN employees e ON e.id = s.employee_id
LEFT JOIN employees m ON m.id::uuid = s.manager_id::uuid;

-- Grant read access to authenticated users
GRANT SELECT ON schedules_with_employee_details TO authenticated;