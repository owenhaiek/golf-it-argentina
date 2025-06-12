
-- First, let's check and fix the RLS policies for the reservations table
-- Drop any existing problematic policies
DROP POLICY IF EXISTS "Users can create their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.reservations;

-- Ensure RLS is enabled
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create clean, simple policies that only use auth.uid() and don't reference auth.users table
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
