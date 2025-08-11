-- Fix linter: set search_path on security definer functions
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
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
SET search_path TO 'public'
AS $$
  select exists (
    select 1 from public.organizations o
    where o.id = p_org_id and o.owner_user_id = p_user_id
  ) or exists (
    select 1 from public.organization_members m
    where m.organization_id = p_org_id and m.user_id = p_user_id and m.org_role in ('owner','admin','manager')
  );
$$;