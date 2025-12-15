import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">{t("profile", "userNotFound") || "Usuario no encontrado"}</h1>
        <p className="text-zinc-500 mb-6">{t("profile", "userNotFoundDesc") || "El perfil que buscas no existe."}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("common", "back") || "Volver"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm">{t("common", "back") || "Volver"}</span>
            </button>
            <h1 className="text-lg font-semibold text-white">
              {t("profile", "profile") || "Perfil"}
            </h1>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4 pb-28">
        <UserProfileCard 
          profile={profile || {}} 
          profileLoading={profileLoading}
          userId={userId}
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
    </div>
  );
};

export default UserProfile;
