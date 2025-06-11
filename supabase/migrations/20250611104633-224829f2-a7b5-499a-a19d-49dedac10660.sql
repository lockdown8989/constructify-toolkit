
-- Add a column to track the current status more explicitly
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS current_status text DEFAULT 'clocked-out';

-- Update existing records to set proper current_status based on active_session and other fields
UPDATE attendance 
SET current_status = CASE 
    WHEN active_session = true AND on_break = true THEN 'on-break'
    WHEN active_session = true AND on_break = false THEN 'clocked-in'
    ELSE 'clocked-out'
END
WHERE current_status IS NULL OR current_status = 'clocked-out';

-- Create a function to update current status
CREATE OR REPLACE FUNCTION update_attendance_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current_status based on the record state
    IF NEW.active_session = true AND NEW.on_break = true THEN
        NEW.current_status = 'on-break';
    ELSIF NEW.active_session = true AND NEW.on_break = false THEN
        NEW.current_status = 'clocked-in';
    ELSE
        NEW.current_status = 'clocked-out';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update current_status
DROP TRIGGER IF EXISTS trigger_update_attendance_status ON attendance;
CREATE TRIGGER trigger_update_attendance_status
    BEFORE INSERT OR UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_status();

-- Add index for better performance when querying current status
CREATE INDEX IF NOT EXISTS idx_attendance_current_status 
ON attendance(employee_id, current_status, date) 
WHERE active_session = true;
