
-- Create table for GPS clocking restrictions
CREATE TABLE public.gps_clocking_restrictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for employee location logs
CREATE TABLE public.employee_location_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  accuracy NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attendance_id UUID,
  is_within_restriction BOOLEAN DEFAULT false,
  restriction_id UUID REFERENCES public.gps_clocking_restrictions(id)
);

-- Add GPS location fields to attendance table
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS gps_latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS gps_longitude NUMERIC(11, 8),
ADD COLUMN IF NOT EXISTS gps_accuracy NUMERIC,
ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS restriction_id UUID REFERENCES public.gps_clocking_restrictions(id);

-- Enable RLS on new tables
ALTER TABLE public.gps_clocking_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_location_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for GPS restrictions (managers can manage)
CREATE POLICY "Managers can view GPS restrictions" 
  ON public.gps_clocking_restrictions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('employer', 'admin', 'hr')
    )
  );

CREATE POLICY "Managers can create GPS restrictions" 
  ON public.gps_clocking_restrictions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('employer', 'admin', 'hr')
    )
  );

CREATE POLICY "Managers can update GPS restrictions" 
  ON public.gps_clocking_restrictions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('employer', 'admin', 'hr')
    )
  );

-- RLS policies for employee location logs
CREATE POLICY "Users can view their own location logs" 
  ON public.employee_location_logs 
  FOR SELECT 
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('employer', 'admin', 'hr')
    )
  );

CREATE POLICY "Users can insert their own location logs" 
  ON public.employee_location_logs 
  FOR INSERT 
  WITH CHECK (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- Function to check if location is within restriction radius
CREATE OR REPLACE FUNCTION public.check_location_within_restriction(
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_restriction_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  restriction_lat NUMERIC;
  restriction_lng NUMERIC;
  restriction_radius INTEGER;
  distance_meters NUMERIC;
BEGIN
  -- Get restriction details
  SELECT latitude, longitude, radius_meters
  INTO restriction_lat, restriction_lng, restriction_radius
  FROM gps_clocking_restrictions
  WHERE id = p_restriction_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Calculate distance using Haversine formula (simplified)
  -- This is an approximation - for production use PostGIS for accurate calculations
  distance_meters := (
    6371000 * acos(
      cos(radians(restriction_lat)) * 
      cos(radians(p_latitude)) * 
      cos(radians(p_longitude) - radians(restriction_lng)) + 
      sin(radians(restriction_lat)) * 
      sin(radians(p_latitude))
    )
  );
  
  RETURN distance_meters <= restriction_radius;
END;
$$;

-- Update attendance trigger to verify GPS location
CREATE OR REPLACE FUNCTION public.verify_gps_location()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  active_restriction RECORD;
BEGIN
  -- Only check GPS when clocking in
  IF NEW.check_in IS NOT NULL AND NEW.gps_latitude IS NOT NULL AND NEW.gps_longitude IS NOT NULL THEN
    -- Find the closest active restriction
    SELECT id, latitude, longitude, radius_meters
    INTO active_restriction
    FROM gps_clocking_restrictions
    WHERE is_active = true
    ORDER BY (
      6371000 * acos(
        cos(radians(latitude)) * 
        cos(radians(NEW.gps_latitude)) * 
        cos(radians(NEW.gps_longitude) - radians(longitude)) + 
        sin(radians(latitude)) * 
        sin(radians(NEW.gps_latitude))
      )
    )
    LIMIT 1;
    
    -- Check if within restriction
    IF active_restriction.id IS NOT NULL THEN
      NEW.location_verified := check_location_within_restriction(
        NEW.gps_latitude, 
        NEW.gps_longitude, 
        active_restriction.id
      );
      NEW.restriction_id := active_restriction.id;
    END IF;
    
    -- Log the location
    INSERT INTO employee_location_logs (
      employee_id, 
      latitude, 
      longitude, 
      accuracy,
      attendance_id,
      is_within_restriction,
      restriction_id
    ) VALUES (
      NEW.employee_id,
      NEW.gps_latitude,
      NEW.gps_longitude,
      NEW.gps_accuracy,
      NEW.id,
      NEW.location_verified,
      NEW.restriction_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for GPS verification
DROP TRIGGER IF EXISTS verify_gps_location_trigger ON public.attendance;
CREATE TRIGGER verify_gps_location_trigger
  BEFORE INSERT OR UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION verify_gps_location();
