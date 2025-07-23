-- Fix appearance settings RLS policies and add better error handling
-- First drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can insert their own appearance settings" ON appearance_settings;
DROP POLICY IF EXISTS "Users can update their own appearance settings" ON appearance_settings;
DROP POLICY IF EXISTS "Users can view their own appearance settings" ON appearance_settings;

-- Create comprehensive RLS policies for appearance settings
CREATE POLICY "Users can view their own appearance settings"
ON appearance_settings
FOR SELECT
TO public
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own appearance settings"
ON appearance_settings
FOR INSERT
TO public
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own appearance settings"
ON appearance_settings
FOR UPDATE
TO public
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create a function to safely upsert appearance settings
CREATE OR REPLACE FUNCTION upsert_appearance_settings(
  p_user_id uuid,
  p_theme text DEFAULT 'system',
  p_color_scheme text DEFAULT 'default',
  p_font_size text DEFAULT 'medium',
  p_high_contrast boolean DEFAULT false,
  p_reduced_motion boolean DEFAULT false,
  p_compact_mode boolean DEFAULT false
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO appearance_settings (
    user_id, theme, color_scheme, font_size, 
    high_contrast, reduced_motion, compact_mode, updated_at
  ) VALUES (
    p_user_id, p_theme, p_color_scheme, p_font_size,
    p_high_contrast, p_reduced_motion, p_compact_mode, now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    theme = EXCLUDED.theme,
    color_scheme = EXCLUDED.color_scheme,
    font_size = EXCLUDED.font_size,
    high_contrast = EXCLUDED.high_contrast,
    reduced_motion = EXCLUDED.reduced_motion,
    compact_mode = EXCLUDED.compact_mode,
    updated_at = now();
END;
$$;