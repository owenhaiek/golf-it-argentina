
-- Drop the existing problematic policies that reference auth.users table
DROP POLICY IF EXISTS "Course managers can view reservations for their courses" ON public.reservations;
DROP POLICY IF EXISTS "Course managers can update reservations for their courses" ON public.reservations;

-- Recreate the course manager policies without referencing auth.users table
-- We'll use a simpler approach that doesn't need to access the auth.users table
CREATE POLICY "Course managers can view reservations for their courses" 
  ON public.reservations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_managers cm 
      INNER JOIN public.profiles p ON p.id = auth.uid()
      WHERE cm.course_id = reservations.course_id 
      AND cm.email = p.full_name -- Using available profile data instead
      AND cm.is_active = true
    )
  );

CREATE POLICY "Course managers can update reservations for their courses" 
  ON public.reservations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_managers cm 
      INNER JOIN public.profiles p ON p.id = auth.uid()
      WHERE cm.course_id = reservations.course_id 
      AND cm.email = p.full_name -- Using available profile data instead
      AND cm.is_active = true
    )
  );
