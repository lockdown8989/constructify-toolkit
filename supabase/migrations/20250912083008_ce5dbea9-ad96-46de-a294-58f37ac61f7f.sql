-- Resolve infinite recursion in RLS for user_roles causing dashboards to mis-detect roles
-- 1) Drop recursive/admin policies that reference user_roles inside policies on user_roles
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can modify existing roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles only" ON public.user_roles;

-- 2) Keep minimal, non-recursive, safe policies
-- Allow users to view ONLY their own roles (no recursion)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_roles' 
      AND policyname='Users can view their own roles') THEN
    CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Allow users to insert their initial role during signup (already exists in many projects)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_roles' 
      AND policyname='Users can insert their initial role during signup') THEN
    CREATE POLICY "Users can insert their initial role during signup"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- NOTE: Admin role assignments should be done via SECURITY DEFINER RPC (assign_user_role_secure)
-- so we intentionally avoid broad UPDATE/DELETE policies here to prevent recursion and abuse.
