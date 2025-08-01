-- Fix the search path issue for the increment_unread_count function
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
DECLARE
  chat_participants UUID[];
  participant_id UUID;
BEGIN
  -- Get all participants in the chat (both employee_id and admin_id mapped to user_id)
  SELECT ARRAY[
    (SELECT user_id FROM employees WHERE id = NEW.chat_id), -- employee user_id 
    (SELECT user_id FROM employees WHERE id = (SELECT admin_id FROM chats WHERE id = NEW.chat_id)) -- admin user_id
  ] INTO chat_participants
  FROM chats WHERE id = NEW.chat_id;
  
  -- Increment unread count for all participants except the sender
  FOREACH participant_id IN ARRAY chat_participants
  LOOP
    -- Skip if this participant is the sender
    IF participant_id IS NOT NULL AND participant_id != (
      SELECT user_id FROM employees WHERE id = NEW.sender_id
    ) THEN
      INSERT INTO user_chat_notifications (user_id, chat_id, unread_count)
      VALUES (participant_id, NEW.chat_id, 1)
      ON CONFLICT (user_id, chat_id)
      DO UPDATE SET 
        unread_count = user_chat_notifications.unread_count + 1,
        updated_at = NOW();
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically increment unread count when new messages are sent
CREATE TRIGGER trigger_increment_unread_count
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION increment_unread_count();