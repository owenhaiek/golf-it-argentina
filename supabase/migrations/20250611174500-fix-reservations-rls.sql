
-- Enable RLS on reservations table
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Add policy for users to create their own reservations
CREATE POLICY "Users can create their own reservations" 
  ON public.reservations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add policy for users to view their own reservations
CREATE POLICY "Users can view their own reservations" 
  ON public.reservations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add policy for users to update their own reservations
CREATE POLICY "Users can update their own reservations" 
  ON public.reservations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add policy for users to delete their own reservations
CREATE POLICY "Users can delete their own reservations" 
  ON public.reservations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add policy for course managers to view reservations for their courses
CREATE POLICY "Course managers can view reservations for their courses" 
  ON public.reservations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_managers cm 
      WHERE cm.course_id = reservations.course_id 
      AND cm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND cm.is_active = true
    )
  );

-- Add policy for course managers to update reservations for their courses
CREATE POLICY "Course managers can update reservations for their courses" 
  ON public.reservations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_managers cm 
      WHERE cm.course_id = reservations.course_id 
      AND cm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND cm.is_active = true
    )
  );
