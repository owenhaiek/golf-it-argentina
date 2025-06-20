
-- Step 1: Get a completely clean slate by dropping ALL policies and functions
DROP POLICY IF EXISTS "Course managers can view reservations for their courses" ON public.reservations;
DROP POLICY IF EXISTS "Course managers can update reservations for their courses" ON public.reservations;
DROP POLICY IF EXISTS "Users can create their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.reservations;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.reservations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.reservations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.reservations;
DROP POLICY IF EXISTS "Allow users to insert their reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow users to select their reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow users to update their reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow users to delete their reservations" ON public.reservations;

-- Drop any functions that might be accessing auth.users
DROP FUNCTION IF EXISTS public.is_course_manager_for_course(uuid);

-- Step 2: Disable and re-enable RLS to ensure completely clean state
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simple, working policies that ONLY use auth.uid()
CREATE POLICY "reservations_insert_policy" 
  ON public.reservations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reservations_select_policy" 
  ON public.reservations 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "reservations_update_policy" 
  ON public.reservations 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "reservations_delete_policy" 
  ON public.reservations 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 4: Ensure user_id is properly configured
ALTER TABLE public.reservations ALTER COLUMN user_id SET NOT NULL;
