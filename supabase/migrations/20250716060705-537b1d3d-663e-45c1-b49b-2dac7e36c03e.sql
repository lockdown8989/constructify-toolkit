-- Fix the missing foreign key relationship for employee_location_logs
ALTER TABLE employee_location_logs 
ADD CONSTRAINT employee_location_logs_employee_id_fkey 
FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;