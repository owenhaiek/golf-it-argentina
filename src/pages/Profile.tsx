import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import ProfileCard from "@/components/profile/ProfileCard";
import RecentRounds from "@/components/profile/RecentRounds";
import { User, Loader } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
      if (!user?.id) return [];
      
      console.log("Fetching rounds from the database");
      
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
      
      console.log("Rounds fetched:", data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    keepPreviousData: false
  });

  // Delete round mutation
  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId: string) => {
      console.log(`Starting deletion of round ${roundId}`);
      if (!user?.id) throw new Error("User not authenticated");
      
      // Delete the round from the database
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', user.id); // Security: ensure user can only delete their own rounds
      
      if (error) {
        console.error("Delete round error:", error);
        throw error;
      }
      
      console.log(`Successfully deleted round ${roundId} from database`);
      return roundId;
    },
    onMutate: (roundId) => {
      console.log(`Optimistically updating UI for round ${roundId}`);
      setDeletingRoundId(roundId);
      
      // Snapshot the current rounds
      const previousRounds = queryClient.getQueryData(['rounds', user?.id]);
      
      // Optimistically update to remove the round from UI
      queryClient.setQueryData(['rounds', user?.id], (old: any[] = []) => 
        old.filter(round => round.id !== roundId)
      );
      
      return { previousRounds };
    },
    onSuccess: async (roundId) => {
      console.log(`Round ${roundId} successfully deleted, updating queries`);
      
      // Show success toast
      toast({
        title: t("profile", "deleteRoundSuccess"),
        description: t("profile", "deleteRoundDescription"),
      });
      
      // First invalidate and update profile data (includes handicap)
      await queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      
      // The key step: completely remove the rounds query and refetch
      // This forces a complete refetch from the server
      queryClient.resetQueries({ queryKey: ['rounds', user?.id] });
      
      // After a short delay, force a new fetch to ensure we get latest data
      setTimeout(() => {
        console.log("Forcing refetch of all rounds data");
        queryClient.invalidateQueries({ 
          queryKey: ['rounds'],
          refetchType: 'all'
        });
      }, 300);
    },
    onError: (error, roundId, context: any) => {
      console.error(`Error deleting round ${roundId}:`, error);
      // Revert to previous state on error
      if (context?.previousRounds) {
        queryClient.setQueryData(['rounds', user?.id], context.previousRounds);
      }
      
      toast({
        title: t("profile", "deleteRoundError"),
        description: error.message || t("profile", "generalError"),
        variant: "destructive"
      });
    },
    onSettled: () => {
      console.log("Delete operation settled, resetting UI state");
      setDeletingRoundId(null);
    }
  });

  const handleDeleteRound = (roundId: string) => {
    if (deletingRoundId) {
      console.log("Deletion already in progress, ignoring request");
      return; // Prevent multiple deletions at once
    }
    console.log(`User initiated deletion of round ${roundId}`);
    deleteRoundMutation.mutate(roundId);
  };

  const isLoading = profileLoading || roundsLoading;

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="flex items-center mb-6 gap-2 px-4">
        <User className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-bold text-primary">{t("profile", "title")}</h1>
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
