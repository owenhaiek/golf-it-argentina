import { useLanguage } from "@/contexts/LanguageContext";
import { FriendsSection } from "@/components/profile/FriendsSection";
import { ChevronLeft, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Friends = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm">{t("common", "profile") || "Perfil"}</span>
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white">
                {t("profile", "friends")}
              </h1>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Button */}
      <div className="p-4 pb-0">
        <Button
          onClick={() => navigate('/search-users')}
          className="w-full h-12 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl justify-start gap-3 border-0"
          variant="outline"
        >
          <Search className="h-4 w-4 text-zinc-500" />
          <span className="text-zinc-500">{t("friends", "searchUsers") || "Buscar usuarios..."}</span>
        </Button>
      </div>

      <div className="p-4 pb-28">
        <FriendsSection />
      </div>
    </div>
  );
};

export default Friends;
