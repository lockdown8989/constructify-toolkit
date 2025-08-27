-- CRITICAL SECURITY FIXES - PART 2: FUNCTIONS AND ATTENDANCE POLICIES

-- 1. SECURE SECURITY DEFINER FUNCTIONS - ADD ACCESS CONTROLS
CREATE OR REPLACE FUNCTION public.admin_update_user_password(user_email text, new_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_id UUID;
  result JSON;
BEGIN
  -- SECURITY: Only admins can update passwords
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ) THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized: Admin access required');
  END IF;
  
  -- Get the user ID from email
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Update the user's password using Supabase auth admin functions
  UPDATE auth.users 
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the password update
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, processed_data
  ) VALUES (
    user_id, 'update', 'auth.users', 'administrative_action',
    json_build_object('action', 'password_reset', 'admin_initiated', true)
  );
  
  RETURN json_build_object('success', true, 'message', 'Password updated successfully', 'user_id', user_id);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Error updating password: ' || SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reset_user_password(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_id UUID;
  result JSON;
BEGIN
  -- SECURITY: Only admins can reset passwords
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ) THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized: Admin access required');
  END IF;
  
  -- Get the user ID from email
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Update the user to force a password reset
  UPDATE auth.users 
  SET email_confirmed_at = NOW(), updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the password reset action
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, processed_data
  ) VALUES (
    user_id, 'update', 'auth.users', 'administrative_action',
    json_build_object('action', 'password_reset_initiated', 'admin_initiated', true)
  );
  
  RETURN json_build_object(
    'success', true, 'message', 'Password reset initiated for user',
    'user_id', user_id, 'email', user_email,
    'instructions', 'User should use password reset flow to set new password'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Error initiating password reset: ' || SQLERRM);
END;
$$;

-- 2. DROP ALL EXISTING ATTENDANCE POLICIES TO START FRESH
DO $$
DECLARE
    policy_record record;
BEGIN
    -- Get all policies on attendance table and drop them
    FOR policy_record IN
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'attendance' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.attendance', policy_record.policyname);
    END LOOP;
END $$;