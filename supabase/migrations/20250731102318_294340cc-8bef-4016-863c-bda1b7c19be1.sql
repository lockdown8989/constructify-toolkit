-- Add privacy settings for user presence visibility
ALTER TABLE user_presence 
ADD COLUMN hide_online_status BOOLEAN DEFAULT FALSE;

-- Add unread message count tracking
CREATE TABLE IF NOT EXISTS user_chat_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, chat_id)
);

-- Enable RLS on the new table
ALTER TABLE user_chat_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for chat notifications
CREATE POLICY "Users can view their own chat notifications"
ON user_chat_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat notifications"
ON user_chat_notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat notifications"
ON user_chat_notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_user_chat_notifications_updated_at
BEFORE UPDATE ON user_chat_notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment unread count when new message is received
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
$$ LANGUAGE plpgsql SECURITY DEFINER;