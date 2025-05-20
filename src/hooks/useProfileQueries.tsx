
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const useProfileQueries = () => {
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
    staleTime: 0, // Consider data always stale
    gcTime: 0    // Don't cache the data at all
  });

  // Delete round mutation with improved error handling
  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId: string) => {
      console.log(`Starting deletion of round ${roundId}`);
      if (!user?.id) throw new Error("User not authenticated");
      
      // Verify the round exists and belongs to the user before deletion
      const { data: roundData, error: verifyError } = await supabase
        .from('rounds')
        .select('id')
        .eq('id', roundId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (verifyError) {
        console.error("Verify round error:", verifyError);
        throw verifyError;
      }
      
      if (!roundData) {
        throw new Error("Round not found or doesn't belong to this user");
      }
      
      // Delete the round from the database
      const { error: deleteError } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', user.id); // Double check the round belongs to this user
      
      if (deleteError) {
        console.error("Delete round error:", deleteError);
        throw deleteError;
      }
      
      console.log(`Successfully deleted round ${roundId} from database`);
      return roundId;
    },
    onMutate: (roundId) => {
      console.log(`Setting UI state for round ${roundId} deletion`);
      setDeletingRoundId(roundId);
      
      // Snapshot the previous value
      const previousRounds = queryClient.getQueryData(['rounds', user?.id]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['rounds', user?.id], (old: any) => {
        if (!old) return [];
        return old.filter((round: any) => round.id !== roundId);
      });
      
      // Return a context object with the snapshot
      return { previousRounds };
    },
    onSuccess: (roundId) => {
      console.log("Round successfully deleted, updating UI");
      
      // Show success toast
      toast({
        title: t("profile", "deleteRoundSuccess"),
        description: t("profile", "deleteRoundDescription"),
      });
      
      // Force refetch to ensure UI is in sync with server
      queryClient.invalidateQueries({
        queryKey: ['rounds', user?.id]
      });
      
      // Also invalidate profile to update any stats that might depend on rounds
      queryClient.invalidateQueries({
        queryKey: ['profile', user?.id]
      });
    },
    onError: (error, roundId, context: any) => {
      console.error(`Error deleting round ${roundId}:`, error);
      
      // Revert to the previous state if available
      if (context?.previousRounds) {
        queryClient.setQueryData(['rounds', user?.id], context.previousRounds);
      }
      
      toast({
        title: t("profile", "deleteRoundError"),
        description: error instanceof Error ? error.message : t("profile", "generalError"),
        variant: "destructive"
      });
    },
    onSettled: () => {
      console.log("Delete operation settled, resetting UI state");
      setDeletingRoundId(null);
    }
  });

  const handleDeleteRound = useCallback((roundId: string) => {
    if (deletingRoundId) {
      console.log("Deletion already in progress, ignoring request");
      return; // Prevent multiple deletions at once
    }
    console.log(`User initiated deletion of round ${roundId}`);
    deleteRoundMutation.mutate(roundId);
  }, [deletingRoundId, deleteRoundMutation]);

  return {
    profile,
    profileLoading,
    rounds,
    roundsLoading,
    deletingRoundId,
    handleDeleteRound,
    refetchRounds
  };
};
