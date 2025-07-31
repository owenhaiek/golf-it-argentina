
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserSearch, Clock, X, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { FriendRequestButton } from "@/components/profile/FriendRequestButton";
import { useFriendsData } from "@/hooks/useFriendsData";

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
  const [recentSearches, setRecentSearches] = useState<Profile[]>([]);
  const [searchFriendsOnly, setSearchFriendsOnly] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { friends } = useFriendsData();
  
  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('recentUserSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Fetch total users count
  const { data: totalUsers } = useQuery({
    queryKey: ["totalUsers"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      
      if (error) {
        console.error("Error fetching total users:", error);
        throw error;
      }
      
      return count || 0;
    },
  });

  // Only fetch when there's a search query
  const { data: profiles, isLoading } = useQuery<Profile[]>({
    queryKey: ["profiles", searchQuery, searchFriendsOnly],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        return [];
      }

      if (searchFriendsOnly) {
        // Filter friends based on search query
        const filteredFriends = friends.filter(friend => 
          friend.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return filteredFriends.map(friend => ({
          id: friend.id,
          username: friend.username,
          full_name: friend.full_name,
          avatar_url: friend.avatar_url,
          handicap: null, // Friends data doesn't include handicap
          updated_at: null
        }));
      } else {
        let query = supabase
          .from("profiles")
          .select("*")
          .order("username");
          
        query = query.or(
          `username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`
        );
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching profiles:", error);
          throw error;
        }
        
        return data || [];
      }
    },
    enabled: !!searchQuery.trim(), // Only run query when there's a search term
    placeholderData: [],
  });

  const saveToRecentSearches = (profile: Profile) => {
    const updated = [profile, ...recentSearches.filter(p => p.id !== profile.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentUserSearches', JSON.stringify(updated));
  };

  const removeFromRecentSearches = (profileId: string) => {
    const updated = recentSearches.filter(p => p.id !== profileId);
    setRecentSearches(updated);
    localStorage.setItem('recentUserSearches', JSON.stringify(updated));
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentUserSearches');
  };

  const handleViewProfile = (profile: Profile) => {
    saveToRecentSearches(profile);
    navigate(`/user/${profile.id}`);
  };

  const handleRecentProfileClick = (profile: Profile) => {
    navigate(`/user/${profile.id}`);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("searchUsers", "findPlayers")}</h1>
          <DarkModeToggle />
        </div>
      </div>
          
          {/* Search Input */}
      <div className="flex-1 overflow-auto">
        <div className="container p-4 max-w-xl mx-auto space-y-6 pb-20">
          {/* Search Controls */}
          <div className="flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <Switch
                id="friends-only"
                checked={searchFriendsOnly}
                onCheckedChange={setSearchFriendsOnly}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="friends-only" className="text-sm font-medium cursor-pointer">
                <Users className={`h-4 w-4 inline mr-1 transition-colors ${searchFriendsOnly ? 'text-primary' : 'text-muted-foreground'}`} />
                Friends Only
                {searchFriendsOnly && friends.length > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {friends.length}
                  </span>
                )}
              </Label>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {searchFriendsOnly ? (
                  <>
                    <Users className="h-4 w-4 inline mr-1" />
                    <span className="font-semibold text-foreground">{friends.length}</span> friends
                  </>
                ) : (
                  <>
                    Total Users: <span className="font-semibold text-foreground">{totalUsers?.toLocaleString() || 0}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <Input
              placeholder={t("searchUsers", "searchByNameOrUsername")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <UserSearch className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
          
          {/* Recent Searches Section */}
          {!searchQuery.trim() && recentSearches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Recent Searches</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllRecentSearches}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-2">
                {recentSearches.map((profile) => (
                  <Card 
                    key={profile.id} 
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div 
                        className="flex items-center gap-4 flex-1"
                        onClick={() => handleRecentProfileClick(profile)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile.avatar_url} alt={profile.username || profile.full_name} />
                          <AvatarFallback>
                            {(profile.username?.charAt(0) || profile.full_name?.charAt(0) || "U").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{profile.full_name}</p>
                          <p className="text-xs text-muted-foreground">@{profile.username || "user"}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromRecentSearches(profile.id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Search Results Section */}
          {searchQuery.trim() && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Search Results</h2>
              
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
                     className="hover:bg-accent/50 transition-colors"
                   >
                     <CardContent className="p-4 flex items-center justify-between">
                       <div 
                         className="flex items-center gap-4 cursor-pointer flex-1"
                         onClick={() => handleViewProfile(profile)}
                       >
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
                       </div>
                       {!searchFriendsOnly && (
                         <FriendRequestButton userId={profile.id} />
                       )}
                     </CardContent>
                   </Card>
                 ))
              )}
            </div>
          )}
          
          {/* Empty State */}
          {!searchQuery.trim() && recentSearches.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <UserSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Start typing to search for players</p>
              <p className="text-sm">Enter a name or username to find other golfers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchUsers;
