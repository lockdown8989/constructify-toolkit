
-- Update the employees table to support new lifecycle values
-- First, drop the existing constraint
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_lifecycle_check;

-- Update existing data to map old values to new ones if needed
UPDATE employees 
SET lifecycle = CASE 
  WHEN lifecycle = 'Active' THEN 'Full time'
  WHEN lifecycle = 'Inactive' THEN 'Part time'
  WHEN lifecycle = 'Terminated' THEN 'Agency'
  ELSE lifecycle
END
WHERE lifecycle IN ('Active', 'Inactive', 'Terminated');

-- Add the new constraint with the correct lifecycle values
ALTER TABLE employees ADD CONSTRAINT employees_lifecycle_values_check 
CHECK (lifecycle IN ('Full time', 'Part time', 'Agency'));

-- Ensure the status constraint is correct (this should already be correct)
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_status_enum_check;
ALTER TABLE employees ADD CONSTRAINT employees_status_values_check 
CHECK (status IN ('Active', 'Inactive', 'Pending'));
