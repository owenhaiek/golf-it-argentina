
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfileData } from "@/hooks/useProfileData";
import ProfileCard from "@/components/profile/ProfileCard";
import RecentRounds from "@/components/profile/RecentRounds";
import UserStatsCard from "@/components/profile/UserStatsCard";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";

const Profile = () => {
  const { user, loading } = useAuth();
  const { profile, profileLoading, rounds, roundsLoading } = useProfileData();

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
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <DarkModeToggle />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
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
          <RecentRounds />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Profile;
