-- Fix security vulnerability: Restrict access to pending_course_managers table
-- Only admins should be able to view sensitive application data

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Admins can view all pending registrations" ON public.pending_course_managers;
DROP POLICY IF EXISTS "Admins can update pending registrations" ON public.pending_course_managers;
DROP POLICY IF EXISTS "Admins can manage pending managers" ON public.pending_course_managers;

-- Create secure admin-only policies for viewing and managing
CREATE POLICY "Admin can view pending registrations" 
ON public.pending_course_managers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@golfitargentina.com'
  )
);

CREATE POLICY "Admin can update pending registrations" 
ON public.pending_course_managers 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@golfitargentina.com'
  )
);

CREATE POLICY "Admin can delete pending registrations" 
ON public.pending_course_managers 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@golfitargentina.com'
  )
);

-- Keep public insert access so people can apply (but limit to essential data)
-- The existing insert policies are fine as they allow applications