-- Delete all existing user data from tables that actually exist
-- First, disable triggers temporarily to avoid conflicts
SET session_replication_role = replica;

-- Delete employee-related data from existing tables only
DELETE FROM clock_notifications WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM employee_location_logs WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM attendance WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM availability_patterns WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM availability_requests WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM calendar_preferences WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM document_assignments WHERE employee_id IN (SELECT id FROM employees);
DELETE FROM documents WHERE employee_id IN (SELECT id FROM employees);

-- Delete chat-related data
DELETE FROM chat_messages;
DELETE FROM chat_participants;
DELETE FROM chats;

-- Delete other user data from existing tables
DELETE FROM user_roles;
DELETE FROM appearance_settings;
DELETE FROM notifications;
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