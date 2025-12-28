-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can check their own email" ON public.pending_course_managers;

-- Fix the course_managers RLS policy that references auth.users
DROP POLICY IF EXISTS "Strict admin access to course managers" ON public.course_managers;

-- Create proper admin access policy for course_managers
CREATE POLICY "Strict admin access to course managers"
ON public.course_managers
FOR ALL
USING (public.is_admin());

-- Allow course managers to read their own record (for login verification)
CREATE POLICY "Managers can view their own record"
ON public.course_managers
FOR SELECT
USING (email = LOWER((current_setting('request.jwt.claims', true))::json->>'email'));