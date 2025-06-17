
-- Fix RLS policies for reservations table to resolve "permission denied for table users" error
-- Drop the problematic policy that references auth.users table directly
DROP POLICY IF EXISTS "Course managers can view reservations for their courses" ON public.reservations;
DROP POLICY IF EXISTS "Course managers can update reservations for their courses" ON public.reservations;

-- Recreate course manager policies using the existing security definer function
-- This avoids direct access to auth.users table which causes permission issues
CREATE POLICY "Course managers can view reservations for their courses" 
  ON public.reservations 
  FOR SELECT 
  TO authenticated
  USING (public.is_course_manager_for_course(course_id));

CREATE POLICY "Course managers can update reservations for their courses" 
  ON public.reservations 
  FOR UPDATE 
  TO authenticated
  USING (public.is_course_manager_for_course(course_id));
