
-- Fix search_path security issues for the functions shown in the warnings

-- Fix update_shift_pattern_assignments_updated_at function
CREATE OR REPLACE FUNCTION public.update_shift_pattern_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Fix generate_pin_code function
CREATE OR REPLACE FUNCTION public.generate_pin_code()
RETURNS text AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Recreate any triggers that use these functions to ensure they use the updated versions
DROP TRIGGER IF EXISTS update_shift_pattern_assignments_updated_at ON shift_pattern_assignments;

CREATE TRIGGER update_shift_pattern_assignments_updated_at
  BEFORE UPDATE ON shift_pattern_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_shift_pattern_assignments_updated_at();
