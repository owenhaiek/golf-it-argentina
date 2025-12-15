
import { useAuth } from "@/contexts/AuthContext";

import { useProfileData } from "@/hooks/useProfileData";
import ProfileCard from "@/components/profile/ProfileCard";
import RecentRounds from "@/components/profile/RecentRounds";
import UserStatsCard from "@/components/profile/UserStatsCard";
import { FriendsSection } from "@/components/profile/FriendsSection";
import { FriendSuggestions } from "@/components/profile/FriendSuggestions";
import { TournamentsAndMatchesSection } from "@/components/profile/TournamentsAndMatchesSection";
import { NotificationButton } from "@/components/ui/NotificationButton";
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
  const { user, loading } = useAuth();
  const { profile, profileLoading, rounds, roundsLoading } = useProfileData();
  const { t } = useLanguage();

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 touch-none">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{t("common", "profile")}</h1>
          <NotificationButton />
        </div>
      </div>
      
      <div className="flex-1">
        <div className="p-4 space-y-6 pb-28">
          <ProfileCard 
            user={user} 
            profile={profile || {}} 
            profileLoading={profileLoading} 
          />
          <UserStatsCard 
            rounds={rounds || []}
            roundsLoading={roundsLoading}
            userId={user.id}
          />
          <TournamentsAndMatchesSection />
          <RecentRounds />
        </div>
      </div>
    </div>
  );
};

export default Profile;
