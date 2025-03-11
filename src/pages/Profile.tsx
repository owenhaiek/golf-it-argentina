
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ProfileCard from "@/components/profile/ProfileCard";
import RecentRounds from "@/components/profile/RecentRounds";
import { User, Loader } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  // Core state and hooks
  const { user } = useAuth();
  const { toast } = useToast();
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
    enabled: !!user?.id
  });

  // Delete round mutation
  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId: string) => {
      console.log(`Starting to delete round: ${roundId}`);
      
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
      return roundId;
    },
    onMutate: (roundId) => {
      setDeletingRoundId(roundId);
      
      // Optimistic update - remove the round from the cache
      const previousRounds = queryClient.getQueryData(['rounds', user?.id]);
      
      queryClient.setQueryData(['rounds', user?.id], (old: any) => {
        if (!old) return old;
        return old.filter((round: any) => round.id !== roundId);
      });
      
      return { previousRounds };
    },
    onSuccess: (roundId) => {
      toast({
        title: "Success",
        description: "Round deleted successfully",
      });
      
      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ['rounds', user?.id]
      });

      // Also invalidate profile to update handicap if needed
      queryClient.invalidateQueries({
        queryKey: ['profile', user?.id]
      });
    },
    onError: (error, roundId, context) => {
      // Revert to the previous data on error
      if (context?.previousRounds) {
        queryClient.setQueryData(['rounds', user?.id], context.previousRounds);
      }
      
      toast({
        title: "Error deleting round",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setDeletingRoundId(null);
    }
  });

  // Handle round deletion
  const handleDeleteRound = (roundId: string) => {
    if (deletingRoundId) return; // Prevent multiple simultaneous deletions
    deleteRoundMutation.mutate(roundId);
  };

  const isLoading = profileLoading || roundsLoading;

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="flex items-center mb-6 gap-2 px-4">
        <User className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-bold text-primary">Your Profile</h1>
        {isLoading && (
          <div className="ml-auto">
            <Loader className="h-5 w-5 text-primary animate-spin" />
          </div>
        )}
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
