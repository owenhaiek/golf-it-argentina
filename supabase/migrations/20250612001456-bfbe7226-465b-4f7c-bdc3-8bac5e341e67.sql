
-- Add missing columns to golf_courses table
ALTER TABLE public.golf_courses 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS hole_distances INTEGER[],
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Standard',
ADD COLUMN IF NOT EXISTS established_year INTEGER;
