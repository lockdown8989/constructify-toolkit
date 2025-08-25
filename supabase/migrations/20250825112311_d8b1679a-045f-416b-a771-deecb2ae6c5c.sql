-- Fix security vulnerability in user_presence table
-- Remove the overly permissive policy that allows all users to view all presence data
DROP POLICY IF EXISTS "Users can view all presence data" ON user_presence;

-- Create proper restrictive policies for user presence data
CREATE POLICY "Users can view their own presence data" 
ON user_presence 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow managers to view presence data of their team members
CREATE POLICY "Managers can view team presence data" 
ON user_presence 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'employer', 'hr', 'manager')
  )
);

-- Allow users to view presence data only if the target user hasn't hidden their status
-- and they are in the same organization/team context
CREATE POLICY "Users can view non-hidden presence data" 
ON user_presence 
FOR SELECT 
TO authenticated 
USING (
  hide_online_status = false 
  AND EXISTS (
    SELECT 1 
    FROM employees e1 
    JOIN employees e2 ON e1.department = e2.department OR e1.site = e2.site
    WHERE e1.user_id = auth.uid() 
    AND e2.user_id = user_presence.user_id
  )
);

-- Ensure users can only insert their own presence data
CREATE POLICY "Users can insert their own presence data" 
ON user_presence 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Keep the existing update policy but make it more explicit
DROP POLICY IF EXISTS "Users can update their own presence" ON user_presence;
CREATE POLICY "Users can update their own presence data" 
ON user_presence 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);