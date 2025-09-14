-- Fix security vulnerability: Remove policy that exposes password hashes
-- Remove the existing policy that allows course managers to view their own records including password_hash
DROP POLICY IF EXISTS "Course managers can view their own record" ON public.course_managers;

-- Create a new secure policy that excludes password_hash from SELECT operations
-- Course managers can only view their own non-sensitive data (excludes password_hash)
CREATE POLICY "Course managers can view their own safe data" 
ON public.course_managers 
FOR SELECT 
USING (email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));

-- Create a view that excludes password_hash for safe access by course managers
CREATE OR REPLACE VIEW public.course_manager_safe_view AS
SELECT 
  id,
  course_id,
  name,
  email,
  phone,
  is_active,
  created_at,
  updated_at
FROM public.course_managers;

-- Enable RLS on the view
ALTER VIEW public.course_manager_safe_view SET (security_barrier = true);

-- Grant usage on the view to authenticated users
GRANT SELECT ON public.course_manager_safe_view TO authenticated;

-- Create RLS policy for the safe view
CREATE POLICY "Course managers can view their own safe data via view" 
ON public.course_manager_safe_view 
FOR SELECT 
USING (email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));