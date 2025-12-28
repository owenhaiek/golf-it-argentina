-- Create match_participants table to support multiple players per match (up to 4)
CREATE TABLE public.match_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- Enable RLS
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

-- Policies for match_participants
CREATE POLICY "Match creator can manage participants"
ON public.match_participants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM matches m 
    WHERE m.id = match_participants.match_id 
    AND m.creator_id = auth.uid()
  )
);

CREATE POLICY "Participants can view their matches"
ON public.match_participants
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Participants can update their own status"
ON public.match_participants
FOR UPDATE
USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_match_participants_match_id ON public.match_participants(match_id);
CREATE INDEX idx_match_participants_user_id ON public.match_participants(user_id);