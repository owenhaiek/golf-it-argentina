
-- Add RLS policy to allow authenticated users to view all rounds for public profiles
-- This enables viewing other users' stats while maintaining security for modifications
CREATE POLICY "Users can view all rounds for public profiles" 
  ON public.rounds 
  FOR SELECT 
  TO authenticated 
  USING (true);
