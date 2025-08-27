-- CRITICAL SECURITY FIXES - PART 1: CLEAN SLATE

-- 1. FIX USER_ROLES RLS POLICIES - PREVENT PRIVILEGE ESCALATION
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;

-- Create secure user_roles policies that prevent self-privilege escalation
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

CREATE POLICY "Users can view their own roles only" ON public.user_roles
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- 2. LOCK DOWN AUTH_EVENTS ACCESS - RESTRICT TO ADMINS ONLY
DROP POLICY IF EXISTS "Auth events are viewable by authenticated users" ON public.auth_events;
DROP POLICY IF EXISTS "Auth events can be inserted by any authenticated context" ON public.auth_events;

CREATE POLICY "Only admins can view auth events" ON public.auth_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

CREATE POLICY "Only system can insert auth events" ON public.auth_events
FOR INSERT
TO authenticated
WITH CHECK (false); -- Block all client inserts, only server functions should insert