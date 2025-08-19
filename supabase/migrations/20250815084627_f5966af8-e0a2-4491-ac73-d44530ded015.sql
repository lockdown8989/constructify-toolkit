-- Fix the trigger function to use correct field names
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Call safe deletion when a user is deleted from auth.users
  PERFORM public.safe_delete_user_data(OLD.id);
  RETURN OLD;
END;
$$;

-- Drop the old trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_user_delete();

-- Now safely delete the test users
DELETE FROM auth.users WHERE email IN ('test@admin.com', 'test@example.com');