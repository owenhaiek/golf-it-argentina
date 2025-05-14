
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

// Define the profile type
interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  handicap: number | null;
  updated_at: string | null;
}

const SearchUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const { data: profiles, isLoading } = useQuery<Profile[]>({
    queryKey: ["profiles", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("username");
        
      if (searchQuery) {
        query = query.or(
          `username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`
        );
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
      
      return data || [];
    },
    placeholderData: [], // Use placeholderData instead of keepPreviousData
  });

  const handleViewProfile = (id: string) => {
    navigate(`/user/${id}`);
  };

  return (
    <div className="container p-4 max-w-xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold">{t("searchUsers", "findPlayers")}</h1>
      
      <div className="relative">
        <Input
          placeholder={t("searchUsers", "searchByNameOrUsername")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <UserSearch className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))
        ) : profiles?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("searchUsers", "noUsersFound")}</p>
          </div>
        ) : (
          profiles?.map((profile) => (
            <Card 
              key={profile.id} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleViewProfile(profile.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.avatar_url} alt={profile.username || profile.full_name} />
                  <AvatarFallback>
                    {(profile.username?.charAt(0) || profile.full_name?.charAt(0) || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-sm text-muted-foreground">@{profile.username || "user"}</p>
                  {profile.handicap !== null && (
                    <p className="text-xs mt-1">
                      {t("profile", "handicap")}: <span className="font-semibold">{profile.handicap}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchUsers;
