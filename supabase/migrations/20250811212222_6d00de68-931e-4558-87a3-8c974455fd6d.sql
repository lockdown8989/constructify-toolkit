-- Phase 2: Performance indexes for common filters
-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON public.attendance (employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance (date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance (status);
CREATE INDEX IF NOT EXISTS idx_attendance_attendance_status ON public.attendance (attendance_status);
CREATE INDEX IF NOT EXISTS idx_attendance_active_session_date ON public.attendance (active_session, date);

-- Employees indexes
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees (user_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON public.employees (manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_status_dept_site ON public.employees (status, department, site);

-- Leave calendar indexes
CREATE INDEX IF NOT EXISTS idx_leave_calendar_employee_id ON public.leave_calendar (employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_calendar_status ON public.leave_calendar (status);
CREATE INDEX IF NOT EXISTS idx_leave_calendar_dates ON public.leave_calendar (start_date, end_date);

-- Schedules indexes (commonly filtered)
CREATE INDEX IF NOT EXISTS idx_schedules_employee_id ON public.schedules (employee_id);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON public.schedules (status);
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON public.schedules (start_time);
