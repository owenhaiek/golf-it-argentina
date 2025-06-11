
-- Add missing RLS policy for users to create their own reservations
CREATE POLICY "Users can create their own reservations" 
  ON public.reservations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add policy for users to view their own reservations
CREATE POLICY "Users can view their own reservations" 
  ON public.reservations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add policy for users to update their own reservations (if needed)
CREATE POLICY "Users can update their own reservations" 
  ON public.reservations 
  FOR UPDATE 
  USING (auth.uid() = user_id);
