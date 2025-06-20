
-- Enable RLS on course_reviews table if not already enabled
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view course reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.course_reviews;

-- Create policy that allows all authenticated users to view course reviews
CREATE POLICY "Anyone can view course reviews" 
  ON public.course_reviews 
  FOR SELECT 
  USING (true);

-- Create policy that allows authenticated users to insert their own reviews
CREATE POLICY "Users can create their own reviews" 
  ON public.course_reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own reviews
CREATE POLICY "Users can update their own reviews" 
  ON public.course_reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
  ON public.course_reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);
