-- Enable realtime for attendance and other important tables
ALTER TABLE public.attendance REPLICA IDENTITY FULL;
ALTER TABLE public.employees REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already added
DO $$
BEGIN
  -- Add tables to realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Tables already in realtime publication';
END $$;