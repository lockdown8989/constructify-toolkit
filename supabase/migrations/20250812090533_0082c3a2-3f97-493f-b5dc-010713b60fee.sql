-- Phase 1: Versioned Rota Releases + Sync State
-- 1) Create shift_template_releases table
CREATE TABLE IF NOT EXISTS public.shift_template_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_template_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'published', -- 'draft' | 'published' | 'archived'
  notes TEXT,
  effective_start_date DATE,
  effective_end_date DATE,
  snapshot_name TEXT, -- template name at publish time
  snapshot_start_time TIME WITHOUT TIME ZONE,
  snapshot_end_time TIME WITHOUT TIME ZONE,
  snapshot_break_duration INTEGER,
  snapshot_grace_period_minutes INTEGER,
  snapshot_overtime_threshold_minutes INTEGER,
  snapshot_days_of_week INTEGER[],
  snapshot_employee_ids UUID[],
  snapshot_location TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shift_template_releases_template ON public.shift_template_releases(shift_template_id);
CREATE INDEX IF NOT EXISTS idx_shift_template_releases_status ON public.shift_template_releases(status);

-- Trigger function: auto-increment version per template
CREATE OR REPLACE FUNCTION public.set_release_version()
RETURNS TRIGGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) INTO max_version
  FROM public.shift_template_releases
  WHERE shift_template_id = NEW.shift_template_id;

  NEW.version := max_version + 1;

  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;

  RETURN NEW;
END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DROP TRIGGER IF EXISTS trg_set_release_version ON public.shift_template_releases;
CREATE TRIGGER trg_set_release_version
BEFORE INSERT ON public.shift_template_releases
FOR EACH ROW EXECUTE FUNCTION public.set_release_version();

-- 2) Create shift_template_sync_state table
CREATE TABLE IF NOT EXISTS public.shift_template_sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_template_id UUID UNIQUE NOT NULL,
  last_published_release_id UUID,
  last_synced_at TIMESTAMPTZ,
  synced_by UUID,
  last_sync_status TEXT, -- 'synced' | 'skipped' | 'error'
  sync_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shift_template_sync_state_template ON public.shift_template_sync_state(shift_template_id);

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.update_shift_template_sync_state_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DROP TRIGGER IF EXISTS trg_update_shift_template_sync_state_updated_at ON public.shift_template_sync_state;
CREATE TRIGGER trg_update_shift_template_sync_state_updated_at
BEFORE UPDATE ON public.shift_template_sync_state
FOR EACH ROW EXECUTE FUNCTION public.update_shift_template_sync_state_updated_at();

-- 3) Enable RLS and policies
ALTER TABLE public.shift_template_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_template_sync_state ENABLE ROW LEVEL SECURITY;

-- Allow management roles to manage (admin, employer, hr, manager)
CREATE POLICY IF NOT EXISTS "management_select_releases"
ON public.shift_template_releases
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin'::app_role,'employer'::app_role,'hr'::app_role,'manager'::app_role])
));

CREATE POLICY IF NOT EXISTS "management_modify_releases"
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

CREATE POLICY IF NOT EXISTS "management_select_sync_state"
ON public.shift_template_sync_state
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = ANY(ARRAY['admin'::app_role,'employer'::app_role,'hr'::app_role,'manager'::app_role])
));

CREATE POLICY IF NOT EXISTS "management_modify_sync_state"
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
