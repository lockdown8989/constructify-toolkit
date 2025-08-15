-- Create trigger to automatically delete user data when auth account is deleted
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Call the existing safe_delete_user_data function
  PERFORM public.safe_delete_user_data(OLD.id);
  RETURN OLD;
END;
$$;

-- Create trigger that fires when a user is deleted from auth.users
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- Also ensure we have a way to manually delete user accounts with all data
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- First delete all user data using the safe delete function
  SELECT public.safe_delete_user_data(target_user_id) INTO result;
  
  -- Then delete the auth user account
  DELETE FROM auth.users WHERE id = target_user_id;
  
  -- Log the account deletion
  INSERT INTO data_processing_log (
    user_id, action_type, table_name, legal_basis, processed_data
  ) VALUES (
    NULL, 'delete', 'auth.users', 'user_request',
    jsonb_build_object(
      'deleted_user_id', target_user_id,
      'account_deletion_timestamp', NOW(),
      'data_cleanup_result', result
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'User account and all associated data deleted successfully',
    'user_id', target_user_id,
    'data_cleanup', result
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', target_user_id
    );
END;
$$;