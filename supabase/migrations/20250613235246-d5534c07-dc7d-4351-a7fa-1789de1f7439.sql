
-- Fix RLS policies for reservations table
-- First, let's make sure we have clean policies

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can select their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.reservations;

-- Make sure RLS is enabled
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for reservations
CREATE POLICY "Users can insert their own reservations" 
  ON public.reservations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own reservations" 
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

-- Also add policies for course managers to view/manage reservations for their courses
-- We'll create a security definer function to check if user is a course manager
CREATE OR REPLACE FUNCTION public.is_course_manager_for_course(course_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_managers cm
    WHERE cm.course_id = course_uuid
    AND cm.email = (
      SELECT email 
      FROM auth.users 
      WHERE id = auth.uid()
    )
    AND cm.is_active = true
  );
$$;

-- Allow course managers to view reservations for their courses
CREATE POLICY "Course managers can view reservations for their courses" 
  ON public.reservations 
  FOR SELECT 
  TO authenticated
  USING (public.is_course_manager_for_course(course_id));

-- Allow course managers to update reservations for their courses
CREATE POLICY "Course managers can update reservations for their courses" 
  ON public.reservations 
  FOR UPDATE 
  TO authenticated
  USING (public.is_course_manager_for_course(course_id));
