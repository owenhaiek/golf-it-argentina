import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { FriendRequestButton } from "./FriendRequestButton";

interface UserProfileData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  handicap?: number | null;
}

interface UserProfileCardProps {
  profile: UserProfileData;
  profileLoading: boolean;
  userId?: string;
}

const UserProfileCard = ({ profile, profileLoading, userId }: UserProfileCardProps) => {
  const { t } = useLanguage();

  if (profileLoading) {
    return (
      <Card className="border-0 shadow-lg bg-zinc-900 h-full">
        <CardHeader className="flex items-center justify-center pb-0">
          <div className="w-24 h-24 rounded-full bg-zinc-800 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4 mt-6">
          <div className="h-6 w-3/4 mx-auto bg-zinc-800 animate-pulse rounded" />
          <div className="h-4 w-1/2 mx-auto bg-zinc-800 animate-pulse rounded" />
          <div className="h-10 w-2/3 mx-auto bg-zinc-800 animate-pulse rounded-full mt-8" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-zinc-900 h-full">
      <CardHeader className="relative pb-0 text-center">
        <div className="relative w-28 h-28 mx-auto mb-2">
          <Avatar className="w-28 h-28 border-4 border-zinc-800 shadow-lg">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-zinc-800 text-zinc-300 text-3xl font-bold">
              {profile?.full_name?.[0] || profile?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="mt-4">
          <CardTitle className="text-2xl font-bold text-white">
            {profile?.full_name || t("profile", "anonymous")}
          </CardTitle>
          {profile?.username && (
            <p className="text-sm text-zinc-400 mb-2">
              @{profile.username}
            </p>
          )}
          <div className="flex items-center justify-center mt-3">
            <span className="text-sm font-medium inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 px-4 py-1.5 rounded-full border border-zinc-700">
              {profile?.handicap !== null && profile?.handicap !== undefined 
                ? `${t("profile", "handicap")}: ${profile.handicap}` 
                : t("profile", "noHandicapYet")
              }
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="text-center pt-6 pb-6">
        <div className="mt-4 flex justify-center">
          {userId && <FriendRequestButton userId={userId} size="default" />}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
