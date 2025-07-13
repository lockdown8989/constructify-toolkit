-- Add new fields to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS employment_type text DEFAULT 'Full-Time',
ADD COLUMN IF NOT EXISTS job_description text,
ADD COLUMN IF NOT EXISTS probation_end_date date;