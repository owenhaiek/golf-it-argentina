import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
    staleTime: 0,
    gcTime: 0
  });

  // Delete round mutation with improved error handling
  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId: string) => {
      console.log(`Starting deletion of round ${roundId}`);
      if (!user?.id) throw new Error("User not authenticated");
      
      // First verify the round exists and belongs to the user
      const { data: existingRound, error: fetchError } = await supabase
        .from('rounds')
        .select('id, user_id')
        .eq('id', roundId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error verifying round:", fetchError);
        throw new Error(`Failed to verify round: ${fetchError.message}`);
      }
      
      if (!existingRound) {
        throw new Error("Round not found or you don't have permission to delete it");
      }
      
      // Delete the round
      const { error: deleteError } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error("Delete round error:", deleteError);
        throw new Error(`Failed to delete round: ${deleteError.message}`);
      }
      
      console.log(`Successfully deleted round ${roundId} from database`);
      return roundId;
    },
    onMutate: (roundId) => {
      console.log(`Setting UI state for round ${roundId} deletion`);
      setDeletingRoundId(roundId);
    },
    onSuccess: (roundId) => {
      console.log("Round successfully deleted, updating UI");
      
      // Immediately update the cache to remove the deleted round
      queryClient.setQueryData(['rounds', user?.id], (old: any) => {
        if (!old) return [];
        return old.filter((round: any) => round.id !== roundId);
      });
      
      // Force refetch to ensure UI is in sync with server
      queryClient.invalidateQueries({
        queryKey: ['rounds', user?.id]
      });
      
      // Also invalidate profile to update any stats that might depend on rounds
      queryClient.invalidateQueries({
        queryKey: ['profile', user?.id]
      });
      
      // Show success toast
      toast({
        title: t("profile", "deleteRoundSuccess"),
        description: t("profile", "deleteRoundDescription"),
      });
    },
    onError: (error, roundId) => {
      console.error(`Error deleting round ${roundId}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : t("profile", "generalError");
      
      toast({
        title: t("profile", "deleteRoundError"),
        description: errorMessage,
        variant: "destructive"
      });
      
      // Try to refetch the data to ensure UI is in sync
      refetchRounds();
    },
    onSettled: () => {
      console.log("Delete operation settled, resetting UI state");
      setDeletingRoundId(null);
    }
  });

  const handleDeleteRound = useCallback((roundId: string) => {
    if (deletingRoundId) {
      console.log("Deletion already in progress, ignoring request");
      return;
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
