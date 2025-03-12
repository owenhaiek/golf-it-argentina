import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ProfileCard from "@/components/profile/ProfileCard";
import RecentRounds from "@/components/profile/RecentRounds";
import { User, Loader } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
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

  // Rounds Query - Fetch user's recent rounds with improved caching
  const {
    data: rounds,
    isLoading: roundsLoading,
  } = useQuery({
    queryKey: ['rounds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
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
      
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 0,
    cacheTime: 0 // Disable caching to ensure fresh data
  });

  // Delete round mutation with improved error handling and optimistic updates
  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', user.id); // Ensure user can only delete their own rounds
      
      if (error) throw error;
      return roundId;
    },
    onMutate: async (roundId) => {
      setDeletingRoundId(roundId);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['rounds', user?.id] });
      
      // Snapshot the previous value
      const previousRounds = queryClient.getQueryData(['rounds', user?.id]);
      
      // Optimistically update the cache
      queryClient.setQueryData(['rounds', user?.id], (old: any[]) => 
        old?.filter(round => round.id !== roundId) || []
      );
      
      return { previousRounds };
    },
    onSuccess: (roundId) => {
      toast({
        title: "Round deleted successfully",
        description: "The round has been removed from your history",
      });
      
      // Force a refresh of both queries
      queryClient.invalidateQueries({ queryKey: ['rounds', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error, roundId, context: any) => {
      // Revert to the previous state if there's an error
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
