-- Create an admin function to update user passwords
CREATE OR REPLACE FUNCTION admin_update_user_password(
  user_email TEXT,
  new_password TEXT
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
  
  -- Update the user's password using Supabase auth admin functions
  -- Note: This requires admin privileges
  UPDATE auth.users 
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the password update
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
    json_build_object('action', 'password_reset', 'admin_initiated', true)
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password updated successfully',
    'user_id', user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error updating password: ' || SQLERRM
    );
END;
$$;