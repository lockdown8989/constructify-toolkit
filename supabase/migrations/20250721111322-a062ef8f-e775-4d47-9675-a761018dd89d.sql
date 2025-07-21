-- Create chats table for conversation threads
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text', -- text, image, ai_response
  sender_type TEXT NOT NULL, -- human_admin, human_employee, ai_bot
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_size INTEGER,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create chat participants table for typing indicators and presence
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL,
  user_id UUID NOT NULL,
  is_typing BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(chat_id, user_id)
);

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats
CREATE POLICY "Users can view their own chats" ON public.chats
FOR SELECT USING (
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
  admin_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can create chats" ON public.chats
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'employer', 'hr'))
);

CREATE POLICY "Users can update their own chats" ON public.chats
FOR UPDATE USING (
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
  admin_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their chats" ON public.messages
FOR SELECT USING (
  chat_id IN (
    SELECT id FROM chats WHERE 
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
    admin_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can create messages in their chats" ON public.messages
FOR INSERT WITH CHECK (
  chat_id IN (
    SELECT id FROM chats WHERE 
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
    admin_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  ) AND
  sender_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (
  sender_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);

-- RLS Policies for chat participants
CREATE POLICY "Users can view participants in their chats" ON public.chat_participants
FOR SELECT USING (
  chat_id IN (
    SELECT id FROM chats WHERE 
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
    admin_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can manage their own participation" ON public.chat_participants
FOR ALL USING (
  user_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION update_chats_updated_at();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_participants_updated_at
BEFORE UPDATE ON public.chat_participants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_message_at in chats
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats 
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_last_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_last_message();

-- Enable realtime for all chat tables
ALTER TABLE public.chats REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_participants REPLICA IDENTITY FULL;

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', false);

-- Storage policies for chat attachments
CREATE POLICY "Users can upload chat attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view chat attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their chat attachments" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'chat-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their chat attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);