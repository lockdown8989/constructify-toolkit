
-- First, let's drop ALL existing constraints that might conflict
ALTER TABLE employees DROP CONSTRAINT IF EXISTS status_check;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS lifecycle_check;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS lifecycle_status_check;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_status_check;

-- Update the lifecycle values to match our constraints
UPDATE employees SET lifecycle = 'Active' WHERE lifecycle = 'Employed';
UPDATE employees SET lifecycle = 'Active' WHERE lifecycle NOT IN ('Active', 'Inactive', 'Terminated');

-- Update the status values
UPDATE employees SET status = 'Active' WHERE status = 'Present';
UPDATE employees SET status = 'Active' WHERE status NOT IN ('Active', 'Inactive', 'Pending');

-- Now add the availability columns safely
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS monday_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS monday_start_time time DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS monday_end_time time DEFAULT '17:00:00',
ADD COLUMN IF NOT EXISTS tuesday_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS tuesday_start_time time DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS tuesday_end_time time DEFAULT '17:00:00',
ADD COLUMN IF NOT EXISTS wednesday_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS wednesday_start_time time DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS wednesday_end_time time DEFAULT '17:00:00',
ADD COLUMN IF NOT EXISTS thursday_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS thursday_start_time time DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS thursday_end_time time DEFAULT '17:00:00',
ADD COLUMN IF NOT EXISTS friday_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS friday_start_time time DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS friday_end_time time DEFAULT '17:00:00',
ADD COLUMN IF NOT EXISTS saturday_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS saturday_start_time time DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS saturday_end_time time DEFAULT '17:00:00',
ADD COLUMN IF NOT EXISTS sunday_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS sunday_start_time time DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS sunday_end_time time DEFAULT '17:00:00';

-- Add the corrected constraints with new names
ALTER TABLE employees ADD CONSTRAINT employees_lifecycle_check 
CHECK (lifecycle IN ('Active', 'Inactive', 'Terminated'));

ALTER TABLE employees ADD CONSTRAINT employees_status_enum_check 
CHECK (status IN ('Active', 'Inactive', 'Pending'));

-- Make sure email is nullable
ALTER TABLE employees ALTER COLUMN email DROP NOT NULL;

-- Ensure role column exists
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role text DEFAULT 'employee';
