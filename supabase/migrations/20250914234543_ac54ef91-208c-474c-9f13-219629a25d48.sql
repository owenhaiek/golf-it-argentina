-- Fix security vulnerability: Remove policy that exposes password hashes
-- Remove the existing policy that allows course managers to view their own records including password_hash
DROP POLICY IF EXISTS "Course managers can view their own record" ON public.course_managers;

-- The existing "Strict admin access to course managers" policy remains, ensuring only admins can access course_managers table
-- Course managers should authenticate via the authenticate_course_manager function which handles password verification securely
-- without exposing password hashes in SELECT operations

-- Create a secure function for course managers to get their own safe data
CREATE OR REPLACE FUNCTION public.get_course_manager_profile(manager_email text)
RETURNS TABLE(
  id uuid,
  course_id uuid,
  name text,
  email text,
  phone text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  course_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data if the request is for the authenticated manager's own email
  -- This prevents one manager from accessing another's data
  IF manager_email != ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    cm.id,
    cm.course_id,
    cm.name,
    cm.email,
    cm.phone,
    cm.is_active,
    cm.created_at,
    cm.updated_at,
    gc.name as course_name
  FROM course_managers cm
  JOIN golf_courses gc ON cm.course_id = gc.id
  WHERE cm.email = manager_email AND cm.is_active = true;
END;
$$;