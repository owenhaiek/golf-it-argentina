import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  course_id: string;
  creator_id: string;
  start_date: string;
  end_date?: string;
  max_players: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  tournament_type: 'stroke_play' | 'match_play';
  entry_fee: number;
  prize_pool: number;
  created_at: string;
  golf_courses?: {
    name: string;
    city?: string;
    state?: string;
  };
  tournament_participants?: Array<{
    id: string;
    user_id: string;
    status: string;
    profiles?: {
      full_name?: string;
      username?: string;
      avatar_url?: string;
    };
  }>;
}

export interface Match {
  id: string;
  name: string;
  course_id: string;
  creator_id: string;
  opponent_id: string;
  match_date: string;
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'cancelled';
  match_type: 'stroke_play' | 'match_play';
  stakes?: string;
  winner_id?: string;
  created_at: string;
  golf_courses?: {
    name: string;
    city?: string;
    state?: string;
  };
  creator?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  opponent?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const useTournamentsAndMatches = () => {
  const { user } = useAuth();

  // Fetch user's tournaments (created or participating in)
  const { data: tournaments, isLoading: tournamentsLoading, refetch: refetchTournaments } = useQuery({
    queryKey: ['userTournaments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          golf_courses (
            name,
            city,
            state
          ),
          tournament_participants (
            id,
            user_id,
            status,
            profiles (
              full_name,
              username,
              avatar_url
            )
          )
        `)
        .or(`creator_id.eq.${user.id},tournament_participants.user_id.eq.${user.id}`)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as Tournament[];
    },
    enabled: !!user?.id,
  });

  // Fetch user's matches (created or challenged)
  const { data: matches, isLoading: matchesLoading, refetch: refetchMatches } = useQuery({
    queryKey: ['userMatches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          golf_courses (
            name,
            city,
            state
          ),
          creator:profiles!matches_creator_id_fkey (
            full_name,
            username,
            avatar_url
          ),
          opponent:profiles!matches_opponent_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .order('match_date', { ascending: false });

      if (error) {
        // Fallback query without joins if the above fails
        const { data: simpleData, error: simpleError } = await supabase
          .from('matches')
          .select('*')
          .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
          .order('match_date', { ascending: false });

        if (simpleError) throw simpleError;
        return simpleData as Match[];
      }

      return data as Match[];
    },
    enabled: !!user?.id,
  });

  // Get tournaments by status
  const upcomingTournaments = tournaments?.filter(t => t.status === 'upcoming') || [];
  const activeTournaments = tournaments?.filter(t => t.status === 'active') || [];
  const completedTournaments = tournaments?.filter(t => t.status === 'completed') || [];

  // Get matches by status
  const pendingMatches = matches?.filter(m => m.status === 'pending') || [];
  const activeMatches = matches?.filter(m => m.status === 'active' || m.status === 'accepted') || [];
  const completedMatches = matches?.filter(m => m.status === 'completed') || [];

  return {
    // Raw data
    tournaments: tournaments || [],
    matches: matches || [],
    
    // Loading states
    tournamentsLoading,
    matchesLoading,
    isLoading: tournamentsLoading || matchesLoading,
    
    // Categorized data
    upcomingTournaments,
    activeTournaments,
    completedTournaments,
    pendingMatches,
    activeMatches,
    completedMatches,
    
    // Refetch functions
    refetchTournaments,
    refetchMatches,
    refetchAll: () => {
      refetchTournaments();
      refetchMatches();
    }
  };
};