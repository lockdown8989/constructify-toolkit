
-- Ensure shift_patterns table has proper foreign key constraints
ALTER TABLE public.employees 
ADD CONSTRAINT fk_employees_shift_pattern 
FOREIGN KEY (shift_pattern_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;

ALTER TABLE public.employees 
ADD CONSTRAINT fk_employees_monday_shift 
FOREIGN KEY (monday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;

ALTER TABLE public.employees 
ADD CONSTRAINT fk_employees_tuesday_shift 
FOREIGN KEY (tuesday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;

ALTER TABLE public.employees 
ADD CONSTRAINT fk_employees_wednesday_shift 
FOREIGN KEY (wednesday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;

ALTER TABLE public.employees 
ADD CONSTRAINT fk_employees_thursday_shift 
FOREIGN KEY (thursday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;

ALTER TABLE public.employees 
ADD CONSTRAINT fk_employees_friday_shift 
FOREIGN KEY (friday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;

ALTER TABLE public.employees 
ADD CONSTRAINT fk_employees_saturday_shift 
FOREIGN KEY (saturday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;

ALTER TABLE public.employees 
ADD CONSTRAINT fk_employees_sunday_shift 
FOREIGN KEY (sunday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;

-- Update the database to include shift pattern information in attendance calculations
-- This ensures attendance records can properly reference shift patterns
ALTER TABLE public.attendance 
ADD CONSTRAINT fk_attendance_shift_pattern 
FOREIGN KEY (shift_pattern_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;

-- Add an index for better performance on shift pattern queries
CREATE INDEX IF NOT EXISTS idx_employees_shift_pattern_id ON public.employees(shift_pattern_id);
CREATE INDEX IF NOT EXISTS idx_employees_monday_shift_id ON public.employees(monday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_tuesday_shift_id ON public.employees(tuesday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_wednesday_shift_id ON public.employees(wednesday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_thursday_shift_id ON public.employees(thursday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_friday_shift_id ON public.employees(friday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_saturday_shift_id ON public.employees(saturday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_sunday_shift_id ON public.employees(sunday_shift_id);
CREATE INDEX IF NOT EXISTS idx_attendance_shift_pattern_id ON public.attendance(shift_pattern_id);
