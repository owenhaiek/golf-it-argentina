-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID NOT NULL REFERENCES public.golf_courses(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  max_players INTEGER DEFAULT 8,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  tournament_type TEXT NOT NULL DEFAULT 'stroke_play' CHECK (tournament_type IN ('stroke_play', 'match_play')),
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_pool DECIMAL(10,2) DEFAULT 0,
  rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament_participants table
CREATE TABLE public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'withdrawn', 'disqualified')),
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Create tournament_scores table for tracking individual round scores
CREATE TABLE public.tournament_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.tournament_participants(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  hole_scores INTEGER[] NOT NULL,
  total_score INTEGER NOT NULL,
  position INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE(tournament_id, participant_id, round_number)
);

-- Create matches table for head-to-head matches
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES public.golf_courses(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'active', 'completed', 'cancelled')),
  match_type TEXT NOT NULL DEFAULT 'stroke_play' CHECK (match_type IN ('stroke_play', 'match_play')),
  stakes TEXT,
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (creator_id != opponent_id)
);

-- Create match_scores table
CREATE TABLE public.match_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hole_scores INTEGER[] NOT NULL,
  total_score INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE(match_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Anyone can view tournaments" 
ON public.tournaments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create tournaments" 
ON public.tournaments 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Tournament creators can update their tournaments" 
ON public.tournaments 
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Tournament creators can delete their tournaments" 
ON public.tournaments 
FOR DELETE 
USING (auth.uid() = creator_id);

-- RLS Policies for tournament_participants
CREATE POLICY "Anyone can view tournament participants" 
ON public.tournament_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can register for tournaments" 
ON public.tournament_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can withdraw from tournaments" 
ON public.tournament_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations" 
ON public.tournament_participants 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for tournament_scores
CREATE POLICY "Anyone can view tournament scores" 
ON public.tournament_scores 
FOR SELECT 
USING (true);

CREATE POLICY "Tournament participants can submit scores" 
ON public.tournament_scores 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tournament_participants tp 
    WHERE tp.tournament_id = tournament_scores.tournament_id 
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Tournament creators and participants can update scores" 
ON public.tournament_scores 
FOR UPDATE 
USING (
  auth.uid() = submitted_by OR
  EXISTS (
    SELECT 1 FROM public.tournaments t 
    WHERE t.id = tournament_scores.tournament_id 
    AND t.creator_id = auth.uid()
  )
);

-- RLS Policies for matches
CREATE POLICY "Users can view matches they're involved in" 
ON public.matches 
FOR SELECT 
USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can create matches" 
ON public.matches 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Match participants can update matches" 
ON public.matches 
FOR UPDATE 
USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

CREATE POLICY "Match creators can delete matches" 
ON public.matches 
FOR DELETE 
USING (auth.uid() = creator_id);

-- RLS Policies for match_scores
CREATE POLICY "Match participants can view scores" 
ON public.match_scores 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.id = match_scores.match_id 
    AND (m.creator_id = auth.uid() OR m.opponent_id = auth.uid())
  )
);

CREATE POLICY "Match participants can submit scores" 
ON public.match_scores 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.id = match_scores.match_id 
    AND (m.creator_id = auth.uid() OR m.opponent_id = auth.uid())
  )
);

CREATE POLICY "Match participants can update scores" 
ON public.match_scores 
FOR UPDATE 
USING (
  auth.uid() = submitted_by OR
  EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.id = match_scores.match_id 
    AND m.creator_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_tournaments_creator ON public.tournaments(creator_id);
CREATE INDEX idx_tournaments_course ON public.tournaments(course_id);
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournaments_start_date ON public.tournaments(start_date);

CREATE INDEX idx_tournament_participants_tournament ON public.tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user ON public.tournament_participants(user_id);

CREATE INDEX idx_tournament_scores_tournament ON public.tournament_scores(tournament_id);
CREATE INDEX idx_tournament_scores_participant ON public.tournament_scores(participant_id);

CREATE INDEX idx_matches_creator ON public.matches(creator_id);
CREATE INDEX idx_matches_opponent ON public.matches(opponent_id);
CREATE INDEX idx_matches_status ON public.matches(status);

CREATE INDEX idx_match_scores_match ON public.match_scores(match_id);
CREATE INDEX idx_match_scores_user ON public.match_scores(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_tournaments_updated_at
BEFORE UPDATE ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();