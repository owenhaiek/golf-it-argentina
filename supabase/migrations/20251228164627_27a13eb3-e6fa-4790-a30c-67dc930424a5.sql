-- Add is_open column to golf_courses for real-time course status
ALTER TABLE golf_courses ADD COLUMN is_open boolean DEFAULT true;

-- Add column comment
COMMENT ON COLUMN golf_courses.is_open IS 'Indicates whether the course is currently open, managed by course managers';