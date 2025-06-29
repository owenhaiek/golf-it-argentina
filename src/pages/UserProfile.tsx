
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfileData } from "@/hooks/useUserProfileData";
import UserProfileCard from "@/components/profile/UserProfileCard";
import UserStatsCard from "@/components/profile/UserStatsCard";
import UserRecentRounds from "@/components/profile/UserRecentRounds";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile, profileLoading, rounds, roundsLoading, isLoading } = useUserProfileData(userId);

  const handleBack = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">User Not Found</h1>
        <p className="text-muted-foreground mb-4">The user profile you're looking for doesn't exist.</p>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common", "back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common", "back")}
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-28">
          <UserProfileCard 
            profile={profile || {}} 
            profileLoading={profileLoading} 
          />
          <UserStatsCard 
            rounds={rounds || []}
            roundsLoading={roundsLoading}
            userId={userId}
          />
          <UserRecentRounds 
            rounds={rounds || []}
            roundsLoading={roundsLoading}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserProfile;
