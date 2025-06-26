
-- Fix search_path security issue for update_shift_pattern_assignments_updated_at function
CREATE OR REPLACE FUNCTION update_shift_pattern_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS update_shift_pattern_assignments_updated_at ON shift_pattern_assignments;

CREATE TRIGGER update_shift_pattern_assignments_updated_at
  BEFORE UPDATE ON shift_pattern_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_shift_pattern_assignments_updated_at();
