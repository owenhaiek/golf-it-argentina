-- Enable realtime for match_participants table
ALTER TABLE public.match_participants REPLICA IDENTITY FULL;

-- Add table to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'match_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_participants;
  END IF;
END $$;