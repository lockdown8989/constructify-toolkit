-- Complete user account deletion while preserving app functionality
-- This migration deletes all existing users and their data but keeps the database structure intact

-- First, delete all user data from public tables (if any remains)
DELETE FROM data_processing_log WHERE user_id IS NOT NULL;
DELETE FROM auth_events;
DELETE FROM clock_notifications;
DELETE FROM employee_location_logs;
DELETE FROM attendance;
DELETE FROM availability_patterns; 
DELETE FROM availability_requests;
DELETE FROM calendar_preferences;
DELETE FROM document_assignments;
DELETE FROM documents;
DELETE FROM chat_messages;
DELETE FROM chat_participants;  
DELETE FROM chats;
DELETE FROM user_roles;
DELETE FROM appearance_settings;
DELETE FROM notifications;
DELETE FROM employees;
DELETE FROM profiles;

-- Create a function to delete all auth users (requires admin privileges)
CREATE OR REPLACE FUNCTION delete_all_auth_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all users and delete them one by one
    FOR user_record IN SELECT id FROM auth.users LOOP
        -- Delete the user from auth.users
        DELETE FROM auth.users WHERE id = user_record.id;
    END LOOP;
    
    RAISE NOTICE 'All auth users have been deleted';
END;
$$;

-- Execute the function to delete all auth users
SELECT delete_all_auth_users();

-- Drop the function as we don't need it anymore
DROP FUNCTION delete_all_auth_users();

-- Log the complete cleanup
INSERT INTO data_processing_log (
  user_id, action_type, table_name, legal_basis, processed_data
) VALUES (
  NULL, 'delete', 'all_users_complete', 'admin_cleanup',
  jsonb_build_object(
    'action', 'complete_user_deletion',
    'deletion_timestamp', NOW(),
    'reason', 'Complete database reset - all users and data deleted',
    'preserved_structure', true
  )
);