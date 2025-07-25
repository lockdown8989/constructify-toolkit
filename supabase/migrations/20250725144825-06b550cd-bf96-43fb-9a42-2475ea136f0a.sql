
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON chats;

-- Create comprehensive RLS policies for chats table
-- Allow users to view chats where they are either the employee or admin
CREATE POLICY "Users can view chats they participate in" 
ON chats FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.user_id = auth.uid() 
    AND (e.id = chats.employee_id OR e.id = chats.admin_id)
  )
);

-- Allow users to create chats where they are either the employee or admin
CREATE POLICY "Users can create chats they participate in" 
ON chats FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.user_id = auth.uid() 
    AND (e.id = chats.employee_id OR e.id = chats.admin_id)
  )
);

-- Allow users to update chats where they are either the employee or admin
CREATE POLICY "Users can update chats they participate in" 
ON chats FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.user_id = auth.uid() 
    AND (e.id = chats.employee_id OR e.id = chats.admin_id)
  )
);

-- Create similar policies for messages table
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can create messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Allow users to view messages in chats they participate in
CREATE POLICY "Users can view messages in their chats" 
ON messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM chats c
    JOIN employees e ON e.user_id = auth.uid()
    WHERE c.id = messages.chat_id 
    AND (e.id = c.employee_id OR e.id = c.admin_id)
  )
);

-- Allow users to create messages in chats they participate in
CREATE POLICY "Users can create messages in their chats" 
ON messages FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chats c
    JOIN employees e ON e.user_id = auth.uid()
    WHERE c.id = messages.chat_id 
    AND (e.id = c.employee_id OR e.id = c.admin_id)
    AND e.id = messages.sender_id
  )
);

-- Allow users to update their own messages
CREATE POLICY "Users can update their own messages" 
ON messages FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.user_id = auth.uid() 
    AND e.id = messages.sender_id
  )
);

-- Ensure RLS is enabled on both tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
