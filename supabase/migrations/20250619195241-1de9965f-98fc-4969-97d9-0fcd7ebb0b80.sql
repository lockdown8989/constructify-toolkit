
-- Force deletion of the stubborn test user using multiple approaches
-- This migration will try different methods to ensure complete removal

-- First, let's try to update the user record to fix any data corruption issues
UPDATE auth.users 
SET 
  aud = COALESCE(aud, 'authenticated'),
  role = COALESCE(role, 'authenticated'),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  phone_confirmed_at = NULL,
  confirmation_sent_at = NULL,
  recovery_sent_at = NULL,
  email_change_sent_at = NULL,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}')
WHERE id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';

-- Now try to delete using the admin function with error handling
DO $$
DECLARE
  target_user_id UUID := 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
BEGIN
  -- First approach: Try standard admin delete
  BEGIN
    PERFORM auth.admin.delete_user(target_user_id);
    RAISE NOTICE 'Successfully deleted user using admin.delete_user';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'admin.delete_user failed: %, attempting alternative methods', SQLERRM;
      
      -- Second approach: Try to manually clean up auth tables
      BEGIN
        -- Delete from auth schema tables (if accessible)
        DELETE FROM auth.refresh_tokens WHERE user_id = target_user_id;
        DELETE FROM auth.sessions WHERE user_id = target_user_id;
        DELETE FROM auth.mfa_factors WHERE user_id = target_user_id;
        DELETE FROM auth.mfa_challenges WHERE factor_id IN (
          SELECT id FROM auth.mfa_factors WHERE user_id = target_user_id
        );
        DELETE FROM auth.identities WHERE user_id = target_user_id;
        
        RAISE NOTICE 'Cleaned up auth-related tables manually';
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Manual auth cleanup failed: %', SQLERRM;
      END;
      
      -- Third approach: Force delete from users table
      BEGIN
        DELETE FROM auth.users WHERE id = target_user_id;
        RAISE NOTICE 'Force deleted from auth.users table';
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Force delete from auth.users failed: %', SQLERRM;
      END;
  END;
END $$;

-- Clean up any remaining data in our app tables just to be sure
DELETE FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM user_roles WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM profiles WHERE id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM notifications WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM notification_settings WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM workflow_requests WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM workflow_notifications WHERE receiver_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b' OR sender_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';

-- Final verification
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b') 
    THEN 'User still exists in auth.users'
    ELSE 'User successfully deleted from auth.users'
  END as deletion_status;

-- Count remaining users
SELECT 'Total remaining users' as info, count(*) as count FROM auth.users;
