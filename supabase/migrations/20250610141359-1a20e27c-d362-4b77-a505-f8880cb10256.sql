
-- Create user_favorites table to store user's favorite golf courses
CREATE TABLE public.user_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.golf_courses(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own favorites" 
  ON public.user_favorites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
  ON public.user_favorites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON public.user_favorites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_course_id ON public.user_favorites(course_id);
