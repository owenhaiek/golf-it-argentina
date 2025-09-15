-- Fix the RLS policy for viewing friends profiles
-- The current policy has a bug where it compares f.user2_id = f.id instead of f.user2_id = profiles.id

DROP POLICY IF EXISTS "Users can view friends profiles" ON public.profiles;

CREATE POLICY "Users can view friends profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() <> id) AND (
    EXISTS ( 
      SELECT 1
      FROM friendships f
      WHERE (
        (f.user1_id = auth.uid() AND f.user2_id = profiles.id) OR 
        (f.user2_id = auth.uid() AND f.user1_id = profiles.id)
      )
    )
  )
);