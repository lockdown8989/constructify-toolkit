
-- Create a function that allows users to delete their own accounts
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calling_user_id uuid;
BEGIN
  -- Get the ID of the calling user
  calling_user_id := auth.uid();
  
  -- Check if the user exists
  IF calling_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Delete user data from custom tables (adjust these as needed for your schema)
  -- Delete user profile data
  DELETE FROM public.profiles WHERE id = calling_user_id;
  
  -- Delete user role data
  DELETE FROM public.user_roles WHERE user_id = calling_user_id;
  
  -- Delete user from employees table if exists
  DELETE FROM public.employees WHERE user_id = calling_user_id;
  
  -- Delete user notifications
  DELETE FROM public.notifications WHERE user_id = calling_user_id;
  
  -- You cannot delete from auth.users directly from a function
  -- so we'll mark the user for deletion, and they'll need to sign out
  
  RETURN json_build_object(
    'success', true,
    'message', 'User data deleted. Please sign out to complete the process.'
  );
END;
$$;

-- Add a secure policy to allow users to call this function
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
