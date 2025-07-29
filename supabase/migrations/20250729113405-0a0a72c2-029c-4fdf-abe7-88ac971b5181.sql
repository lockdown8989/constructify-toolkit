-- Fix salary field to ensure it cannot be null and has a default value
ALTER TABLE employees 
ALTER COLUMN salary SET DEFAULT 0;

-- Update any existing null salary values to 0
UPDATE employees 
SET salary = 0 
WHERE salary IS NULL;