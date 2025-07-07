-- Enable Google and Facebook OAuth providers
-- Note: This is a configuration change that needs to be done in the Supabase dashboard
-- This SQL will prepare any necessary database changes for OAuth users

-- Ensure user profiles can handle OAuth users
-- Add OAuth provider info to profiles if needed
DO $$
BEGIN
  -- Check if oauth_provider column exists in profiles table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'oauth_provider') THEN
    ALTER TABLE public.profiles ADD COLUMN oauth_provider TEXT;
  END IF;
  
  -- Check if oauth_id column exists in profiles table  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'oauth_id') THEN
    ALTER TABLE public.profiles ADD COLUMN oauth_id TEXT;
  END IF;
END $$;

-- Update the handle_new_user function to handle OAuth providers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name,
    oauth_provider,
    oauth_id
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'provider', 'email'),
    COALESCE(new.raw_user_meta_data->>'provider_id', new.id::text)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'employee');
  
  RETURN new;
END;
$$;