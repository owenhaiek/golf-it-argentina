
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ProfileCard from "@/components/profile/ProfileCard";
import RecentRounds from "@/components/profile/RecentRounds";
import { User } from "lucide-react";
import { useState } from "react";

const Profile = () => {
  // Core state and hooks
  const { user } = useAuth();
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);

  // Profile Query - Fetch user profile data
  const {
    data: profile,
    isLoading: profileLoading
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id
  });

  // Rounds Query - Fetch user's recent rounds
  const {
    data: rounds,
    isLoading: roundsLoading,
    refetch: refetchRounds
  } = useQuery({
    queryKey: ['rounds', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log("Fetching rounds for user:", user.id);
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          golf_courses (
            name,
            hole_pars,
            holes,
            image_url,
            address,
            city,
            state,
            par
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error("Rounds fetch error:", error);
        throw error;
      }
      
      console.log("Rounds fetched successfully:", data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Never consider the data stale automatically
    gcTime: Infinity, // Keep the data in cache indefinitely
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false // Don't refetch when reconnecting
  });

  // Handle round deletion
  const handleDeleteRound = async (roundId: string) => {
    if (deletingRoundId) return; // Prevent multiple simultaneous deletions
    
    setDeletingRoundId(roundId);
    console.log(`Starting to delete round: ${roundId}`);
    
    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', user?.id);
      
      if (error) {
        console.error("Error deleting round:", error);
        throw error;
      }
      
      console.log(`Successfully deleted round: ${roundId}`);
      
      // Manually update the local cache to remove the deleted round
      if (rounds) {
        const updatedRounds = rounds.filter(round => round.id !== roundId);
        refetchRounds();
      }
    } catch (error) {
      console.error("Failed to delete round:", error);
    } finally {
      setDeletingRoundId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="flex items-center mb-6 gap-2 px-4">
        <User className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-bold text-primary">Your Profile</h1>
      </div>
      
      <div className="flex flex-col gap-6 pb-6 px-0">
        <div className="w-full">
          <ProfileCard user={user} profile={profile} profileLoading={profileLoading} />
        </div>
        
        <div className="w-full">
          <RecentRounds 
            userId={user?.id} 
            rounds={rounds} 
            roundsLoading={roundsLoading} 
            onDeleteRound={handleDeleteRound}
            deletingRoundId={deletingRoundId}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
