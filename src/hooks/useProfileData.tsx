
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  handicap?: number;
  updated_at?: string;
}

interface Round {
  id: string;
  user_id: string;
  course_id: string;
  date: string;
  score: number;
  notes?: string;
  created_at: string;
  golf_courses?: {
    name: string;
    par?: number;
  };
}

export const useProfileData = () => {
  const {
    profile,
    profileLoading,
    rounds,
    roundsLoading,
    deletingRoundId,
    handleDeleteRound,
    refetchRounds
  } = useProfileQueries();

  const isLoading = profileLoading || roundsLoading;
  
  // Refetch rounds data when the component mounts to ensure fresh data
  useEffect(() => {
    refetchRounds();
    // Also set up an interval to periodically refetch rounds (cleanup on unmount)
    const intervalId = setInterval(() => {
      refetchRounds();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [refetchRounds]);

  return {
    profile,
    profileLoading,
    rounds,
    roundsLoading,
    deletingRoundId,
    handleDeleteRound,
    refetchRounds,
    isLoading
  };
};
