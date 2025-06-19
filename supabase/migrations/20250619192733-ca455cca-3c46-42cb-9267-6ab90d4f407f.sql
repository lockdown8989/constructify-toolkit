
-- Fix the security warning for clean_uuid_fields function  
-- Set a secure search_path to prevent search_path injection attacks

CREATE OR REPLACE FUNCTION public.clean_uuid_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;
