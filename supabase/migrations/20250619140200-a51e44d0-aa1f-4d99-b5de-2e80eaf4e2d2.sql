
-- Safe migration to handle UUID fields without type casting issues
-- We'll use string functions to identify and clean problematic values

-- First, let's create a safer cleaning function that works with text comparison
CREATE OR REPLACE FUNCTION safe_clean_uuid_field(input_value text) 
RETURNS uuid AS $$
BEGIN
  -- If the value is null, empty, or not a valid UUID format, return NULL
  IF input_value IS NULL OR 
     input_value = '' OR 
     char_length(input_value) != 36 OR
     input_value !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN NULL;
  END IF;
  
  -- Try to cast to UUID, return NULL if it fails
  BEGIN
    RETURN input_value::uuid;
  EXCEPTION 
    WHEN invalid_text_representation THEN
      RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql;

-- Now safely update the UUID fields using our function
UPDATE employees 
SET shift_pattern_id = safe_clean_uuid_field(shift_pattern_id::text);

UPDATE employees 
SET monday_shift_id = safe_clean_uuid_field(monday_shift_id::text);

UPDATE employees 
SET tuesday_shift_id = safe_clean_uuid_field(tuesday_shift_id::text);

UPDATE employees 
SET wednesday_shift_id = safe_clean_uuid_field(wednesday_shift_id::text);

UPDATE employees 
SET thursday_shift_id = safe_clean_uuid_field(thursday_shift_id::text);

UPDATE employees 
SET friday_shift_id = safe_clean_uuid_field(friday_shift_id::text);

UPDATE employees 
SET saturday_shift_id = safe_clean_uuid_field(saturday_shift_id::text);

UPDATE employees 
SET sunday_shift_id = safe_clean_uuid_field(sunday_shift_id::text);

-- Clean up manager_id field (text field)
UPDATE employees 
SET manager_id = NULLIF(manager_id, '');

-- Create the trigger function to prevent future issues
CREATE OR REPLACE FUNCTION clean_uuid_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Use our safe cleaning function for UUID fields
  NEW.shift_pattern_id = safe_clean_uuid_field(NEW.shift_pattern_id::text);
  NEW.monday_shift_id = safe_clean_uuid_field(NEW.monday_shift_id::text);
  NEW.tuesday_shift_id = safe_clean_uuid_field(NEW.tuesday_shift_id::text);
  NEW.wednesday_shift_id = safe_clean_uuid_field(NEW.wednesday_shift_id::text);
  NEW.thursday_shift_id = safe_clean_uuid_field(NEW.thursday_shift_id::text);
  NEW.friday_shift_id = safe_clean_uuid_field(NEW.friday_shift_id::text);
  NEW.saturday_shift_id = safe_clean_uuid_field(NEW.saturday_shift_id::text);
  NEW.sunday_shift_id = safe_clean_uuid_field(NEW.sunday_shift_id::text);
  
  -- Clean manager_id (text field)
  NEW.manager_id = NULLIF(NEW.manager_id, '');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clean UUID fields
DROP TRIGGER IF EXISTS trigger_clean_uuid_fields ON employees;
CREATE TRIGGER trigger_clean_uuid_fields
  BEFORE INSERT OR UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION clean_uuid_fields();

-- Clean up the helper function (we don't need it after the migration)
DROP FUNCTION IF EXISTS safe_clean_uuid_field(text);
