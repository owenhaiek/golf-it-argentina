import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { FriendsSection } from "@/components/profile/FriendsSection";
import { FriendRequestButton } from "@/components/profile/FriendRequestButton";
import { ChevronLeft, Users, Search, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  handicap: number | null;
}

const Friends = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: profiles, isLoading: searchLoading } = useQuery<Profile[]>({
    queryKey: ["profiles", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .order("username")
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!searchQuery.trim(),
    placeholderData: [],
  });

  const handleViewProfile = (profile: Profile) => {
    navigate(`/user/${profile.id}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

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
      
      {/* Search Input */}
      <div className="p-4 pb-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder={language === "es" ? "Buscar usuarios..." : "Search users..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
            className="h-12 pl-11 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {isSearching && searchQuery.trim() && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">
              {language === "es" ? "Resultados" : "Results"}
            </p>
            <button
              onClick={clearSearch}
              className="text-xs text-primary"
            >
              {language === "es" ? "Cancelar" : "Cancel"}
            </button>
          </div>
          
          {searchLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900">
                  <div className="h-12 w-12 bg-zinc-800 rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : profiles && profiles.length > 0 ? (
            <div className="space-y-2">
              {profiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900"
                >
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => handleViewProfile(profile)}
                  >
                    <Avatar className="h-12 w-12 border-2 border-zinc-700">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-300">
                        {profile.full_name?.charAt(0) || profile.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">
                        {profile.full_name || profile.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        @{profile.username || 'user'}
                      </p>
                    </div>
                  </div>
                  <FriendRequestButton userId={profile.id} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-500">
                {language === "es" ? "No se encontraron usuarios" : "No users found"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Friends Section - Only show when not searching */}
      {(!isSearching || !searchQuery.trim()) && (
        <div className="p-4 pb-28">
          <FriendsSection />
        </div>
      )}
    </div>
  );
};

export default Friends;
