
-- Safe deletion of specific users while preserving app functionality
-- This will delete the two users shown in your screenshot

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

-- Delete user data for Stanislav Stefanov (4c88f25b-78b2-45ec-b6d6-22c4286e78df)
DELETE FROM clock_notifications WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM workflow_notifications WHERE receiver_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df' OR sender_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df';
DELETE FROM notifications WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df';
DELETE FROM shift_notifications WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM shift_applications WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM open_shift_assignments WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM shift_swaps WHERE requester_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
) OR recipient_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM schedule_conflicts WHERE schedule_id IN (
  SELECT id FROM schedules WHERE employee_id IN (
    SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
  )
);
DELETE FROM schedules WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM attendance WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM availability_requests WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM availability_patterns WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM leave_calendar WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM document_assignments WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM documents WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM payroll WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM salary_statistics WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM calendar_preferences WHERE employee_id IN (
  SELECT id FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df'
);
DELETE FROM notification_settings WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df';
DELETE FROM workflow_requests WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df';
DELETE FROM employees WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df';
DELETE FROM user_roles WHERE user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df';
DELETE FROM profiles WHERE id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df';
DELETE FROM role_audit_log WHERE changed_user_id = '4c88f25b-78b2-45ec-b6d6-22c4286e78df' OR changed_by = '4c88f25b-78b2-45ec-b6d6-22c4286e78df';
DELETE FROM role_audit_log WHERE changed_user_id = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b' OR changed_by = 'c8c03ecb-7976-479b-8c2d-a8b65f3bf26b';

-- Finally, delete the users from auth.users using the admin function
DO $$
BEGIN
    -- Delete Test User
    BEGIN
        PERFORM auth.admin.delete_user('c8c03ecb-7976-479b-8c2d-a8b65f3bf26b');
        RAISE NOTICE 'Successfully deleted Test User';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Failed to delete Test User: %', SQLERRM;
    END;
    
    -- Delete Stanislav Stefanov
    BEGIN
        PERFORM auth.admin.delete_user('4c88f25b-78b2-45ec-b6d6-22c4286e78df');
        RAISE NOTICE 'Successfully deleted Stanislav Stefanov';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Failed to delete Stanislav Stefanov: %', SQLERRM;
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
