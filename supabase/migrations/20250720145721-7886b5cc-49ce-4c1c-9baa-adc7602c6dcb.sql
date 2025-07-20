-- Create appearance_settings table for user appearance preferences
CREATE TABLE IF NOT EXISTS public.appearance_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system',
  color_scheme TEXT NOT NULL DEFAULT 'default',
  font_size TEXT NOT NULL DEFAULT 'medium',
  high_contrast BOOLEAN NOT NULL DEFAULT false,
  reduced_motion BOOLEAN NOT NULL DEFAULT false,
  compact_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.appearance_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for appearance_settings
CREATE POLICY "Users can view their own appearance settings" 
ON public.appearance_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appearance settings" 
ON public.appearance_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appearance settings" 
ON public.appearance_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_appearance_settings_updated_at
BEFORE UPDATE ON public.appearance_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default appearance settings for existing users who don't have them
INSERT INTO public.appearance_settings (user_id, theme, color_scheme, font_size)
SELECT u.id, 'system', 'default', 'medium'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.appearance_settings a WHERE a.user_id = u.id
);