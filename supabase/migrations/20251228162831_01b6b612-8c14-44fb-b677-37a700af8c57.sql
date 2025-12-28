-- Drop existing problematic RLS policies on pending_course_managers
DROP POLICY IF EXISTS "Admin can view pending registrations" ON public.pending_course_managers;
DROP POLICY IF EXISTS "Admin can update pending registrations" ON public.pending_course_managers;
DROP POLICY IF EXISTS "Admin can delete pending registrations" ON public.pending_course_managers;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (current_setting('request.jwt.claims', true))::json->>'email' = 'admin@golfitargentina.com'),
    false
  )
$$;

-- Create new RLS policies that don't reference auth.users directly
CREATE POLICY "Admin can view pending registrations"
ON public.pending_course_managers
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admin can update pending registrations"
ON public.pending_course_managers
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admin can delete pending registrations"
ON public.pending_course_managers
FOR DELETE
USING (public.is_admin());

-- Allow anyone to check if their own email exists (for duplicate check during registration)
CREATE POLICY "Users can check their own email"
ON public.pending_course_managers
FOR SELECT
USING (
  email = LOWER((current_setting('request.jwt.claims', true))::json->>'email')
  OR 
  -- Allow unauthenticated users to check email during registration
  auth.uid() IS NULL
);