
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

  // Rounds Query - Fetch user's recent rounds with caching disabled
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
    gcTime: 0,    // Don't cache the data at all
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true // Always refetch on mount
  });

  // Delete round mutation with completely rewritten implementation
  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId: string) => {
      console.log(`Starting deletion of round ${roundId}`);
      if (!user?.id) throw new Error("User not authenticated");
      
      // Attempt to delete the round from the database
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Delete round error:", error);
        throw error;
      }
      
      console.log(`Successfully deleted round ${roundId} from database`);
      return roundId;
    },
    onMutate: async (roundId) => {
      // Set UI state to indicate deletion in progress
      setDeletingRoundId(roundId);
      
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['rounds', user?.id] });
      
      // Snapshot the previous rounds data for potential rollback
      const previousRounds = queryClient.getQueryData(['rounds', user?.id]);
      
      // Perform an optimistic update by removing the deleted round from UI
      queryClient.setQueryData(['rounds', user?.id], (old: any[]) => {
        return old ? old.filter(round => round.id !== roundId) : [];
      });
      
      return { previousRounds };
    },
    onSuccess: (roundId) => {
      console.log("Round successfully deleted, updating UI");
      
      // Force refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['rounds', user?.id] });
      
      // Show success toast
      toast({
        title: t("profile", "deleteRoundSuccess"),
        description: t("profile", "deleteRoundDescription"),
      });
    },
    onError: (error, roundId, context: any) => {
      console.error(`Error deleting round ${roundId}:`, error);
      
      // Restore previous data if available
      if (context?.previousRounds) {
        queryClient.setQueryData(['rounds', user?.id], context.previousRounds);
      }
      
      // Show error toast
      toast({
        title: t("profile", "deleteRoundError"),
        description: error instanceof Error ? error.message : t("profile", "generalError"),
        variant: "destructive"
      });
    },
    onSettled: () => {
      // Clear deleting state regardless of outcome
      setDeletingRoundId(null);
      
      // Final refetch to ensure consistency
      refetchRounds();
    }
  });

  // Handler for deleting rounds
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
