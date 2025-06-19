
-- Safe deletion of specific users while preserving app functionality
-- This will delete the test user and any other remaining users

-- Delete user data for the test user (c8c03ecb-7976-479b-8c2d-a8b65f3bf26b)
DELETE FROM clock_notifications WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM workflow_notifications WHERE receiver_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b' OR sender_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM notifications WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM shift_notifications WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM shift_applications WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM open_shift_assignments WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM shift_swaps WHERE requester_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
) OR recipient_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM schedule_conflicts WHERE schedule_id IN (
  SELECT id FROM schedules WHERE employee_id IN (
    SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
  )
);
DELETE FROM schedules WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM attendance WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM availability_requests WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM availability_patterns WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM leave_calendar WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM document_assignments WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM documents WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM payroll WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM salary_statistics WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM calendar_preferences WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b'
);
DELETE FROM notification_settings WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM workflow_requests WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM employees WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM user_roles WHERE user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM profiles WHERE id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';
DELETE FROM role_audit_log WHERE changed_user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b' OR changed_by = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';

-- Also clean up any other remaining users that might have been missed
DELETE FROM clock_notifications WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id IS NOT NULL
);
DELETE FROM workflow_notifications WHERE receiver_id IS NOT NULL OR sender_id IS NOT NULL;
DELETE FROM notifications WHERE user_id IS NOT NULL;
DELETE FROM shift_notifications WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id IS NOT NULL
);
DELETE FROM shift_applications WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id IS NOT NULL
);
DELETE FROM open_shift_assignments WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id IS NOT NULL
);
DELETE FROM shift_swaps WHERE requester_id IS NOT NULL OR recipient_id IS NOT NULL;
DELETE FROM schedule_conflicts;
DELETE FROM schedules WHERE employee_id IS NOT NULL;
DELETE FROM attendance WHERE employee_id IS NOT NULL;
DELETE FROM availability_requests WHERE employee_id IS NOT NULL;
DELETE FROM availability_patterns WHERE employee_id IS NOT NULL;
DELETE FROM leave_calendar WHERE employee_id IS NOT NULL;
DELETE FROM document_assignments WHERE employee_id IS NOT NULL;
DELETE FROM documents WHERE employee_id IS NOT NULL;
DELETE FROM payroll WHERE employee_id IS NOT NULL;
DELETE FROM salary_statistics WHERE employee_id IS NOT NULL;
DELETE FROM calendar_preferences WHERE employee_id IS NOT NULL;
DELETE FROM notification_settings WHERE user_id IS NOT NULL;
DELETE FROM workflow_requests WHERE user_id IS NOT NULL;
DELETE FROM employees WHERE user_id IS NOT NULL;
DELETE FROM user_roles WHERE user_id IS NOT NULL;
DELETE FROM profiles WHERE id IS NOT NULL;
DELETE FROM role_audit_log;

-- Finally, delete the users from auth.users using the admin function
DO $$
BEGIN
    -- Delete Test User specifically
    BEGIN
        PERFORM auth.admin.delete_user('c8c03ecb-7976-479b-8c2d-a8b65f3bf26b');
        RAISE NOTICE 'Successfully deleted Test User';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Failed to delete Test User: %', SQLERRM;
    END;
    
    -- Clean up any other remaining users
    DECLARE
        user_record RECORD;
    BEGIN
        FOR user_record IN SELECT id FROM auth.users LOOP
            BEGIN
                PERFORM auth.admin.delete_user(user_record.id);
                RAISE NOTICE 'Successfully deleted user: %', user_record.id;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Failed to delete user %: %', user_record.id, SQLERRM;
            END;
        END LOOP;
    END;
END $$;

-- Verify the cleanup
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
