
-- Fix the security warning for safe_clean_uuid_field function
-- Set a secure search_path to prevent search_path injection attacks

CREATE OR REPLACE FUNCTION public.safe_clean_uuid_field(input_text text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return NULL if input is null or empty
  IF input_text IS NULL OR input_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Try to cast to UUID, return NULL if invalid
  BEGIN
    RETURN input_text::uuid;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN NULL;
  END;
END;
$$;
