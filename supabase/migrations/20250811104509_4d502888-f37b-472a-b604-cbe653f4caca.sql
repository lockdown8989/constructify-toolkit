-- Organizations and org-level subscriptions for Stripe
-- 1) Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mgr_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper to generate unique manager codes like MGR-12345
CREATE OR REPLACE FUNCTION public.generate_mgr_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  code text;
BEGIN
  code := 'MGR-' || LPAD((FLOOR(RANDOM() * 90000 + 10000))::int::text, 5, '0');
  RETURN code;
END;
$$;

-- Ensure mgr_code has a default generator
ALTER TABLE public.organizations
  ALTER COLUMN mgr_code SET DEFAULT public.generate_mgr_code();

-- 2) Organization members
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_role TEXT NOT NULL DEFAULT 'member', -- 'owner'|'admin'|'manager'|'member'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- 3) Subscribers (org-level)
-- Stores subscription status at the organization level. The user_id/email correspond to the org owner/admin payer.
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID,             -- owner/admin user id
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_org_subscription UNIQUE (organization_id),
  CONSTRAINT unique_subscriber_email UNIQUE (email)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Functions to check org membership/admin
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_org_id and m.user_id = p_user_id
  ) or exists (
    select 1 from public.organizations o
    where o.id = p_org_id and o.owner_user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_org_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  select exists (
    select 1 from public.organizations o
    where o.id = p_org_id and o.owner_user_id = p_user_id
  ) or exists (
    select 1 from public.organization_members m
    where m.organization_id = p_org_id and m.user_id = p_user_id and m.org_role in ('owner','admin','manager')
  );
$$;

-- RLS policies
-- organizations
CREATE POLICY "select_orgs_if_member" ON public.organizations
FOR SELECT TO authenticated
USING (public.is_org_member(id, auth.uid()));

CREATE POLICY "insert_org_owned" ON public.organizations
FOR INSERT TO authenticated
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "update_org_owned" ON public.organizations
FOR UPDATE TO authenticated
USING (owner_user_id = auth.uid());

-- organization_members
CREATE POLICY "select_own_memberships" ON public.organization_members
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_user_id = auth.uid()
));

CREATE POLICY "insert_members_owner_only" ON public.organization_members
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_user_id = auth.uid()
));

CREATE POLICY "update_members_owner_only" ON public.organization_members
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_user_id = auth.uid()
));

CREATE POLICY "delete_members_owner_only" ON public.organization_members
FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_user_id = auth.uid()
));

-- subscribers
CREATE POLICY "select_subscription_if_member" ON public.subscribers
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = subscribers.organization_id AND m.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = subscribers.organization_id AND o.owner_user_id = auth.uid()
  )
);

-- Allow edge functions (service role) to insert/update
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "update_subscription" ON public.subscribers
FOR UPDATE TO authenticated
USING (true);

-- Timestamps update trigger helper if needed in future
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
