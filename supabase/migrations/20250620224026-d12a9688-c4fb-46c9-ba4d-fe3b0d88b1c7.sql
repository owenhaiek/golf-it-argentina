
-- First, let's ensure we have no policies that reference auth.users table
-- Drop any remaining problematic policies and functions
DROP POLICY IF EXISTS "Course managers can view reservations for their courses" ON public.reservations;
DROP POLICY IF EXISTS "Course managers can update reservations for their courses" ON public.reservations;
DROP FUNCTION IF EXISTS public.is_course_manager_for_course(uuid);

-- Completely disable and re-enable RLS to ensure clean state
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can create their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.reservations;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.reservations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.reservations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.reservations;

-- Create brand new, simple policies that only use auth.uid()
CREATE POLICY "Allow users to insert their reservations" 
  ON public.reservations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to select their reservations" 
  ON public.reservations 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their reservations" 
  ON public.reservations 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their reservations" 
  ON public.reservations 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Verify the user_id column exists and is properly configured
-- This should already exist but let's make sure
ALTER TABLE public.reservations ALTER COLUMN user_id SET NOT NULL;
