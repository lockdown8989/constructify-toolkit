-- Simple approach: Delete all user data directly
-- First, disable triggers temporarily to avoid conflicts
SET session_replication_role = replica;

-- Delete all user-related data in the correct order
DELETE FROM shift_notifications WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM shift_applications WHERE employee_id IN (SELECT id FROM employees);  
DELETE FROM clock_notifications WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM employee_location_logs WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM shift_pattern_assignments WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM attendance WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM availability_patterns WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM availability_requests WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM calendar_preferences WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM document_assignments WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM documents WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM leave_calendar WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM open_shift_assignments WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM payroll WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM salary_statistics WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM schedules WHERE employee_id IN (SELECT id FROM employees);

-- Delete chat-related data
DELETE FROM chat_messages WHERE chat_id IN (SELECT id FROM chats);
DELETE FROM chat_participants;
DELETE FROM user_chat_notifications;
DELETE FROM chats;

-- Delete other user data
DELETE FROM workflow_requests;
DELETE FROM notification_settings;
DELETE FROM user_roles;
DELETE FROM appearance_settings;
DELETE FROM notifications;
DELETE FROM user_presence;
DELETE FROM employees;
DELETE FROM profiles;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Log the mass deletion
INSERT INTO data_processing_log (
  user_id, action_type, table_name, legal_basis, processed_data
) VALUES (
  NULL, 'delete', 'all_users', 'admin_cleanup',
  jsonb_build_object(
    'action', 'mass_user_deletion',
    'deletion_timestamp', NOW(),
    'reason', 'Database reset - all existing users deleted'
  )
);