-- Create employee record for d0bl3@abv.bg user
INSERT INTO public.employees (
  user_id,
  name,
  email,
  job_title,
  department,
  site,
  salary,
  role,
  status,
  lifecycle,
  manager_id
)
SELECT 
  'c684afbf-9856-4b6e-a240-1c9073d03d26',
  'Manager User',
  'd0bl3@abv.bg',
  'Manager',
  'Management',
  'Head Office',
  50000,
  'manager',
  'Active',
  'Active',
  public.generate_manager_id()
WHERE NOT EXISTS (
  SELECT 1 FROM public.employees 
  WHERE user_id = 'c684afbf-9856-4b6e-a240-1c9073d03d26'
);