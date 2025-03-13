
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
    refetch: refetchRounds
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
    gcTime: 0 // Don't cache the data at all
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
      console.log(`Setting UI state for round ${roundId} deletion`);
      setDeletingRoundId(roundId);
    },
    onSuccess: async (roundId) => {
      console.log(`Round ${roundId} successfully deleted, updating UI`);
      
      // Show success toast
      toast({
        title: t("profile", "deleteRoundSuccess"),
        description: t("profile", "deleteRoundDescription"),
      });
      
      // Immediately clear all query cache related to rounds
      queryClient.removeQueries({ queryKey: ['rounds', user?.id] });
      
      // Invalidate profile data (includes handicap)
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      
      // Force a new fetch of rounds data
      console.log("Forcing refetch of rounds data");
      refetchRounds();
    },
    onError: (error) => {
      console.error(`Error deleting round:`, error);
      
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
