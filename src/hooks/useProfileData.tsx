
import { useEffect } from "react";
import { useProfileQueries } from "./useProfileQueries";

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
