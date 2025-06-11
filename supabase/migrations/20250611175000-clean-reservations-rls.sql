
-- First, drop ALL existing policies on reservations table to start clean
DROP POLICY IF EXISTS "Users can create their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Course managers can view reservations for their courses" ON public.reservations;
DROP POLICY IF EXISTS "Course managers can update reservations for their courses" ON public.reservations;

-- Ensure RLS is enabled on reservations table
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create simple, clean policies that only use auth.uid() and don't reference auth.users table
CREATE POLICY "Users can create their own reservations" 
  ON public.reservations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reservations" 
  ON public.reservations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations" 
  ON public.reservations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations" 
  ON public.reservations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- For now, we'll skip the course manager policies to avoid any auth.users table access
-- Course managers can be added later with a different approach if needed
