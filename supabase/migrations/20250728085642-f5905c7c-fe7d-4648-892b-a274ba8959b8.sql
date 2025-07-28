-- Create user_presence table for better presence tracking
CREATE TABLE IF NOT EXISTS public.user_presence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_id UUID,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  socket_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_presence_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_presence_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE
);

-- Enable RLS on user_presence
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Create policies for user_presence
CREATE POLICY "Users can view all presence data" ON public.user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON public.user_presence
  FOR ALL USING (auth.uid() = user_id);

-- Create unique index to prevent duplicate presence records
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_presence_user_id ON public.user_presence(user_id);

-- Enable real-time for user_presence
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- Function to upsert user presence
CREATE OR REPLACE FUNCTION public.upsert_user_presence(
  p_user_id UUID,
  p_employee_id UUID,
  p_is_online BOOLEAN,
  p_socket_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  presence_id UUID;
BEGIN
  INSERT INTO public.user_presence (user_id, employee_id, is_online, socket_id, updated_at)
  VALUES (p_user_id, p_employee_id, p_is_online, p_socket_id, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    is_online = EXCLUDED.is_online,
    socket_id = EXCLUDED.socket_id,
    last_seen = CASE WHEN EXCLUDED.is_online THEN NOW() ELSE user_presence.last_seen END,
    updated_at = NOW()
  RETURNING id INTO presence_id;
  
  RETURN presence_id;
END;
$$;