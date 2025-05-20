
-- This migration adds latitude and longitude columns to the golf_courses table
-- if they don't already exist

DO $$
BEGIN
    -- Check if latitude column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'golf_courses'
        AND column_name = 'latitude'
    ) THEN
        -- Add latitude column
        ALTER TABLE public.golf_courses ADD COLUMN latitude double precision;
    END IF;

    -- Check if longitude column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'golf_courses'
        AND column_name = 'longitude'
    ) THEN
        -- Add longitude column
        ALTER TABLE public.golf_courses ADD COLUMN longitude double precision;
    END IF;
END
$$;
