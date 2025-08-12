-- Fix: Re-create policies without IF NOT EXISTS
-- Enable RLS (safe to re-run)
ALTER TABLE public.shift_template_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_template_sync_state ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS management_select_releases ON public.shift_template_releases;
DROP POLICY IF EXISTS management_modify_releases ON public.shift_template_releases;
DROP POLICY IF EXISTS management_select_sync_state ON public.shift_template_sync_state;
DROP POLICY IF EXISTS management_modify_sync_state ON public.shift_template_sync_state;

-- Create policies
CREATE POLICY management_select_releases
ON public.shift_template_releases
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin'::app_role,'employer'::app_role,'hr'::app_role,'manager'::app_role])
));

CREATE POLICY management_modify_releases
ON public.shift_template_releases
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin'::app_role,'employer'::app_role,'hr'::app_role,'manager'::app_role])
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin'::app_role,'employer'::app_role,'hr'::app_role,'manager'::app_role])
));

CREATE POLICY management_select_sync_state
ON public.shift_template_sync_state
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin'::app_role,'employer'::app_role,'hr'::app_role,'manager'::app_role])
));

CREATE POLICY management_modify_sync_state
ON public.shift_template_sync_state
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin'::app_role,'employer'::app_role,'hr'::app_role,'manager'::app_role])
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin'::app_role,'employer'::app_role,'hr'::app_role,'manager'::app_role])
));