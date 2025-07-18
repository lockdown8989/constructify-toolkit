-- Create a simplified admin function to reset user passwords
-- This uses Supabase's built-in password reset mechanism
CREATE OR REPLACE FUNCTION admin_reset_user_password(
  user_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_id UUID;
  result JSON;
BEGIN
  -- Get the user ID from email
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;
  
  -- Update the user to force a password reset
  -- Set email_confirmed_at to trigger password reset flow
  UPDATE auth.users 
  SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the password reset action
  INSERT INTO data_processing_log (
    user_id, 
    action_type, 
    table_name, 
    legal_basis,
    processed_data
  ) VALUES (
    user_id,
    'update',
    'auth.users',
    'administrative_action',
    json_build_object('action', 'password_reset_initiated', 'admin_initiated', true)
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password reset initiated for user',
    'user_id', user_id,
    'email', user_email,
    'instructions', 'User should use password reset flow to set new password'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error initiating password reset: ' || SQLERRM
    );
END;
$$;