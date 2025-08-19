-- Complete user account deletion handling foreign key constraints
-- Delete all user data and clean up foreign key references before deleting auth users

-- Step 1: Clean up all tables that might have foreign key references to auth.users
-- First delete data from all user-related tables

-- Delete employee-related data first (these tables depend on employees)
DELETE FROM shift_notifications;
DELETE FROM shift_applications;
DELETE FROM clock_notifications;
DELETE FROM employee_location_logs;
DELETE FROM shift_template_assignments;
DELETE FROM attendance;
DELETE FROM availability_patterns; 
DELETE FROM availability_requests;
DELETE FROM calendar_preferences;
DELETE FROM document_assignments;
DELETE FROM documents;
DELETE FROM leave_calendar;
DELETE FROM open_shift_assignments;
DELETE FROM payroll;
DELETE FROM payroll_history;
DELETE FROM salary_statistics;
DELETE FROM schedules;
DELETE FROM shift_swaps;
DELETE FROM open_shifts; -- This was causing the foreign key constraint violation
DELETE FROM chat_messages;
DELETE FROM chat_participants;  
DELETE FROM chats;
DELETE FROM user_chat_notifications;
DELETE FROM user_presence;

-- Delete organization and meeting data that might reference users
DELETE FROM organization_members;
DELETE FROM organizations;
DELETE FROM meetings;
DELETE FROM messages;

-- Delete workflow and subscription data
DELETE FROM workflow_notifications;
DELETE FROM workflow_requests;
DELETE FROM subscription_events;
DELETE FROM subscribers;

-- Delete user settings and roles
DELETE FROM user_roles;
DELETE FROM appearance_settings;
DELETE FROM notification_settings;
DELETE FROM user_consent;
DELETE FROM notifications;

-- Delete employee records and profiles
DELETE FROM employees;
DELETE FROM profiles;

-- Step 2: Now safely delete all users from auth.users
-- Use a cursor-based approach to avoid potential issues with large datasets
DO $$
DECLARE
    user_id uuid;
BEGIN
    FOR user_id IN SELECT id FROM auth.users LOOP
        DELETE FROM auth.users WHERE id = user_id;
    END LOOP;
    RAISE NOTICE 'All auth users have been deleted';
END
$$;

-- Step 3: Clean up any remaining system data
DELETE FROM data_processing_log WHERE user_id IS NOT NULL;
DELETE FROM auth_events;

-- Step 4: Log the complete cleanup
INSERT INTO data_processing_log (
  user_id, action_type, table_name, legal_basis, processed_data
) VALUES (
  NULL, 'delete', 'complete_database_reset', 'admin_cleanup',
  jsonb_build_object(
    'action', 'complete_user_and_data_deletion',
    'deletion_timestamp', NOW(),
    'reason', 'Complete database reset - all users and associated data deleted',
    'preserved_structure', true,
    'tables_cleaned', ARRAY[
      'open_shifts', 'shift_notifications', 'shift_applications', 'clock_notifications',
      'employee_location_logs', 'shift_template_assignments', 'attendance', 'availability_patterns',
      'availability_requests', 'calendar_preferences', 'document_assignments', 'documents',
      'leave_calendar', 'open_shift_assignments', 'payroll', 'payroll_history', 'salary_statistics',
      'schedules', 'shift_swaps', 'chat_messages', 'chat_participants', 'chats', 'user_chat_notifications',
      'user_presence', 'organization_members', 'organizations', 'meetings', 'messages',
      'workflow_notifications', 'workflow_requests', 'subscription_events', 'subscribers',
      'user_roles', 'appearance_settings', 'notification_settings', 'user_consent', 
      'notifications', 'employees', 'profiles', 'auth.users'
    ]
  )
);