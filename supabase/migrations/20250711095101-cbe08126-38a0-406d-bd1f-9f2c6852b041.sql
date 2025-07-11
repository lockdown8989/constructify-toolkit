-- Add pin_code column to employees table
ALTER TABLE public.employees 
ADD COLUMN pin_code TEXT DEFAULT '1234';

-- Create function to generate random 4-digit PIN
CREATE OR REPLACE FUNCTION generate_pin_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;

-- Update existing employees with unique PIN codes
UPDATE public.employees 
SET pin_code = generate_pin_code()
WHERE pin_code = '1234' OR pin_code IS NULL;