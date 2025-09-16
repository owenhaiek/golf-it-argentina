import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Accept match mutation
  const acceptMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'accepted' })
        .eq('id', matchId);

      if (error) throw error;

      // Create notification for the match creator
      const match = matches?.find(m => m.id === matchId);
      if (match) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: match.creator_id,
            type: 'match_accepted',
            title: 'Match Accepted',
            message: `Your match "${match.name}" has been accepted!`,
            data: { match_id: matchId }
          });

        if (notificationError) console.error('Error creating notification:', notificationError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMatches'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Match Accepted",
        description: "You have accepted the match challenge!",
      });
    },
    onError: (error) => {
      console.error('Error accepting match:', error);
      toast({
        title: "Error",
        description: "Failed to accept match. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Decline match mutation
  const declineMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'cancelled' })
        .eq('id', matchId);

      if (error) throw error;

      // Create notification for the match creator
      const match = matches?.find(m => m.id === matchId);
      if (match) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: match.creator_id,
            type: 'match_declined',
            title: 'Match Declined',
            message: `Your match "${match.name}" has been declined.`,
            data: { match_id: matchId }
          });

        if (notificationError) console.error('Error creating notification:', notificationError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMatches'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Match Declined",
        description: "You have declined the match challenge.",
      });
    },
    onError: (error) => {
      console.error('Error declining match:', error);
      toast({
        title: "Error",
        description: "Failed to decline match. Please try again.",
        variant: "destructive",
      });
    },
  });

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
    },

    // Match actions
    acceptMatch: acceptMatchMutation.mutate,
    declineMatch: declineMatchMutation.mutate,
    isAcceptingMatch: acceptMatchMutation.isPending,
    isDecliningMatch: declineMatchMutation.isPending,
  };
};