
-- First, let's clean up all existing problematic policies and create proper RLS policies for all tables

-- ===== RESERVATIONS TABLE =====
-- Drop all existing policies on reservations table
DROP POLICY IF EXISTS "Users can create their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Course managers can view reservations for their courses" ON public.reservations;
DROP POLICY IF EXISTS "Course managers can update reservations for their courses" ON public.reservations;

-- Ensure RLS is enabled on reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create clean user policies for reservations
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

-- ===== PROFILES TABLE =====
-- Drop existing policies on profiles table first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ===== ROUNDS TABLE =====
-- Drop existing policies on rounds table first
DROP POLICY IF EXISTS "Users can create their own rounds" ON public.rounds;
DROP POLICY IF EXISTS "Users can view their own rounds" ON public.rounds;
DROP POLICY IF EXISTS "Users can update their own rounds" ON public.rounds;
DROP POLICY IF EXISTS "Users can delete their own rounds" ON public.rounds;

-- Enable RLS on rounds
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- Create policies for rounds
CREATE POLICY "Users can create their own rounds" 
  ON public.rounds 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own rounds" 
  ON public.rounds 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rounds" 
  ON public.rounds 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rounds" 
  ON public.rounds 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ===== USER_FAVORITES TABLE =====
-- Drop existing policies on user_favorites table first
DROP POLICY IF EXISTS "Users can create their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

-- Enable RLS on user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user_favorites
CREATE POLICY "Users can create their own favorites" 
  ON public.user_favorites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own favorites" 
  ON public.user_favorites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON public.user_favorites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ===== COURSE_REVIEWS TABLE =====
-- Drop existing policies on course_reviews table first
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can view all reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.course_reviews;

-- Enable RLS on course_reviews
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for course_reviews
CREATE POLICY "Users can create their own reviews" 
  ON public.course_reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all reviews" 
  ON public.course_reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own reviews" 
  ON public.course_reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.course_reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ===== GOLF_COURSES TABLE =====
-- Drop existing policies on golf_courses table first
DROP POLICY IF EXISTS "Anyone can view golf courses" ON public.golf_courses;

-- Enable RLS on golf_courses (public read access)
ALTER TABLE public.golf_courses ENABLE ROW LEVEL SECURITY;

-- Create policy for golf_courses (public read)
CREATE POLICY "Anyone can view golf courses" 
  ON public.golf_courses 
  FOR SELECT 
  USING (true);
