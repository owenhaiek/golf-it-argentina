
-- Enable RLS on course_managers table if not already enabled
ALTER TABLE public.course_managers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage course managers" ON public.course_managers;
DROP POLICY IF EXISTS "Anyone can register as pending manager" ON public.pending_course_managers;
DROP POLICY IF EXISTS "Admins can manage pending managers" ON public.pending_course_managers;
DROP POLICY IF EXISTS "Course managers can manage course reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can manage their own rounds" ON public.rounds;
DROP POLICY IF EXISTS "Anyone can view course reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view golf courses" ON public.golf_courses;
DROP POLICY IF EXISTS "Course managers can update their course" ON public.golf_courses;

-- Create RLS policies for course_managers table
CREATE POLICY "Admins can manage course managers" 
  ON public.course_managers 
  FOR ALL 
  USING (true);

-- Enable RLS on pending_course_managers table if not already enabled  
ALTER TABLE public.pending_course_managers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pending_course_managers table
CREATE POLICY "Anyone can register as pending manager" 
  ON public.pending_course_managers 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can manage pending managers" 
  ON public.pending_course_managers 
  FOR ALL 
  USING (true);

-- Enable RLS on reservations table if not already enabled
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Course managers can view and manage reservations for their course
CREATE POLICY "Course managers can manage course reservations" 
  ON public.reservations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_managers cm 
      WHERE cm.course_id = reservations.course_id 
      AND cm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND cm.is_active = true
    )
  );

-- Enable RLS on rounds table if not already enabled
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rounds table
CREATE POLICY "Users can manage their own rounds" 
  ON public.rounds 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Enable RLS on course_reviews table if not already enabled
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_reviews table
CREATE POLICY "Anyone can view course reviews" 
  ON public.course_reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create reviews" 
  ON public.course_reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.course_reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Anyone can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Enable RLS on golf_courses table if not already enabled
ALTER TABLE public.golf_courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for golf_courses table
CREATE POLICY "Anyone can view golf courses" 
  ON public.golf_courses 
  FOR SELECT 
  USING (true);

CREATE POLICY "Course managers can update their course" 
  ON public.golf_courses 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_managers cm 
      WHERE cm.course_id = golf_courses.id 
      AND cm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND cm.is_active = true
    )
  );
