
import { useProfileQueries } from "@/hooks/useProfileQueries";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import ProfileCard from "@/components/profile/ProfileCard";
import RecentRounds from "@/components/profile/RecentRounds";
import { User, Loader } from "lucide-react";
import { useEffect, useCallback } from "react";

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
  
  // Improved data refresh strategy
  const refreshData = useCallback(() => {
    console.log("Refreshing rounds data");
    refetchRounds();
  }, [refetchRounds]);
  
  // Refetch rounds data when the component mounts and set up refresh intervals
  useEffect(() => {
    // Initial fetch
    refreshData();
    
    // Set up periodic refresh (every 5 seconds)
    const intervalId = setInterval(() => {
      if (!deletingRoundId) { // Don't refresh during deletion
        refreshData();
      }
    }, 5000);
    
    // Set up focus-based refresh
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshData, deletingRoundId]);

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
        
        <div className="w-full pb-20">
          <RecentRounds 
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
