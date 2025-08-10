-- Create meetings table and RLS policies, and trigger to notify employees on new meeting

-- 1) Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  scheduled_at timestamptz NOT NULL,
  location text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON public.meetings (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON public.meetings (created_by);

-- 2) Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- 3) Helper function to check roles (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 4) RLS policies
-- Allow all authenticated users to read meetings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meetings' AND policyname = 'Authenticated users can read meetings'
  ) THEN
    CREATE POLICY "Authenticated users can read meetings"
    ON public.meetings
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Allow only Admin and Payroll to insert meetings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meetings' AND policyname = 'Admins and Payroll can create meetings'
  ) THEN
    CREATE POLICY "Admins and Payroll can create meetings"
    ON public.meetings
    FOR INSERT
    TO authenticated
    WITH CHECK (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'payroll'::public.app_role)
    );
  END IF;
END $$;

-- Allow Admin/Payroll or creator to update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meetings' AND policyname = 'Admins/Payroll or creator can update meetings'
  ) THEN
    CREATE POLICY "Admins/Payroll or creator can update meetings"
    ON public.meetings
    FOR UPDATE
    TO authenticated
    USING (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'payroll'::public.app_role) OR
      created_by = auth.uid()
    )
    WITH CHECK (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'payroll'::public.app_role) OR
      created_by = auth.uid()
    );
  END IF;
END $$;

-- Allow Admin/Payroll or creator to delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'meetings' AND policyname = 'Admins/Payroll or creator can delete meetings'
  ) THEN
    CREATE POLICY "Admins/Payroll or creator can delete meetings"
    ON public.meetings
    FOR DELETE
    TO authenticated
    USING (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'payroll'::public.app_role) OR
      created_by = auth.uid()
    );
  END IF;
END $$;

-- 5) Timestamps trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_meetings_updated_at'
  ) THEN
    CREATE TRIGGER trg_meetings_updated_at
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 6) Notify employees when a new meeting is created
-- The function public.notify_employees_of_new_meeting() already exists in this project.
-- Create the trigger to call it on insert.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_notify_employees_new_meeting'
  ) THEN
    CREATE TRIGGER trg_notify_employees_new_meeting
    AFTER INSERT ON public.meetings
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_employees_of_new_meeting();
  END IF;
END $$;