
-- Add hole_handicaps column to the golf_courses table
ALTER TABLE public.golf_courses 
ADD COLUMN IF NOT EXISTS hole_handicaps integer[];
