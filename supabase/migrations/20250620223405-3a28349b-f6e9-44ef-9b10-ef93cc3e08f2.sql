
-- First, let's completely reset the RLS policies on the reservations table
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can create their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can insert their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can select their own reservations" ON public.reservations;

-- Create simple, working policies
CREATE POLICY "Enable insert for authenticated users" 
  ON public.reservations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable select for authenticated users" 
  ON public.reservations 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users" 
  ON public.reservations 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for authenticated users" 
  ON public.reservations 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);
