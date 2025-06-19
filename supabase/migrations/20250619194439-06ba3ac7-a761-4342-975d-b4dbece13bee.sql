
-- Clean up all user data and auth records while preserving app functionality
-- This will delete all users and their associated data from all tables

-- First, delete all related data in the correct order to avoid foreign key conflicts
DELETE FROM clock_notifications;
DELETE FROM workflow_notifications;
DELETE FROM notifications;
DELETE FROM shift_notifications;
DELETE FROM shift_applications;  
DELETE FROM open_shift_assignments;
DELETE FROM shift_swaps;
DELETE FROM schedule_conflicts;
DELETE FROM schedules;
DELETE FROM attendance;
DELETE FROM availability_requests;
DELETE FROM availability_patterns;
DELETE FROM leave_calendar;
DELETE FROM document_assignments;
DELETE FROM documents;
DELETE FROM payroll;
DELETE FROM payroll_history;
DELETE FROM salary_statistics;
DELETE FROM labor_costs;
DELETE FROM labor_analytics;
DELETE FROM calendar_preferences;
DELETE FROM notification_settings;
DELETE FROM workflow_requests;
DELETE FROM employees;
DELETE FROM user_roles;
DELETE FROM profiles;
DELETE FROM role_audit_log;
DELETE FROM auth_events;

-- Delete users from auth.users table using a safe approach
-- Note: We cannot directly delete from auth.users in a migration, 
-- but we can use the admin functions to clean them up
DO $$
DECLARE
    user_record RECORD;
    deletion_count INTEGER := 0;
BEGIN
    -- Loop through all users and delete them
    FOR user_record IN SELECT id FROM auth.users ORDER BY created_at DESC LOOP
        BEGIN
            -- Use the admin delete function to properly remove users
            PERFORM auth.admin.delete_user(user_record.id);
            deletion_count := deletion_count + 1;
        EXCEPTION
            WHEN OTHERS THEN
                -- Log any errors but continue with other users
                RAISE NOTICE 'Failed to delete user %: %', user_record.id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Successfully deleted % users', deletion_count;
END $$;

-- Verify the cleanup by checking remaining records
SELECT 
    'auth.users' as table_name, 
    count(*) as remaining_records 
FROM auth.users
UNION ALL
SELECT 'employees', count(*) FROM employees
UNION ALL  
SELECT 'user_roles', count(*) FROM user_roles
UNION ALL
SELECT 'profiles', count(*) FROM profiles
ORDER BY table_name;
