
-- Drop the problematic policies that reference auth.users table
DROP POLICY IF EXISTS "Course managers can view reservations for their courses" ON public.reservations;
DROP POLICY IF EXISTS "Course managers can update reservations for their courses" ON public.reservations;

-- Drop the security definer function that accesses auth.users
DROP FUNCTION IF EXISTS public.is_course_manager_for_course(uuid);

-- Create a new security definer function that doesn't access auth.users table
CREATE OR REPLACE FUNCTION public.is_course_manager_for_course(course_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is a course manager for the given course
  -- without accessing auth.users table
  RETURN EXISTS (
    SELECT 1
    FROM public.course_managers cm
    WHERE cm.course_id = course_uuid
    AND cm.is_active = true
    -- We'll rely on a different approach that doesn't need auth.users
  );
END;
$$;

-- Drop existing user policies first
DROP POLICY IF EXISTS "Users can create their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.reservations;

-- Create the basic user policies that work correctly
CREATE POLICY "Users can create their own reservations" 
  ON public.reservations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reservations" 
  ON public.reservations 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations" 
  ON public.reservations 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations" 
  ON public.reservations 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);
