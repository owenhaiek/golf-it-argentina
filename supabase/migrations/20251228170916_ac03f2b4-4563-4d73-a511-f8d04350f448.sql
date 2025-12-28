-- Enable REPLICA IDENTITY FULL for real-time updates on golf_courses
ALTER TABLE public.golf_courses REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.golf_courses;