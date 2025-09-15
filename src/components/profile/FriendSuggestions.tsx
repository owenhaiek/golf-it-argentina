import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Sparkles, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendsData } from "@/hooks/useFriendsData";
import { FriendRequestButton } from "./FriendRequestButton";
interface SuggestedUser {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  handicap: number | null;
}
export const FriendSuggestions = () => {
  const {
    user
  } = useAuth();
  const {
    friends
  } = useFriendsData();
  const {
    data: suggestions,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['friendSuggestions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get current friend IDs
      const friendIds = friends.map(friend => friend.id);

      // Get users who are not already friends and not the current user
      const {
        data,
        error
      } = await supabase.from('profiles').select('id, full_name, username, avatar_url, handicap').not('id', 'in', `(${[user.id, ...friendIds].join(',')})`).not('full_name', 'is', null).limit(4).order('updated_at', {
        ascending: false
      });
      if (error) throw error;
      return data as SuggestedUser[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            People You May Know
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            People You May Know
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/5 transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src={suggestion.avatar_url || undefined} />
                <AvatarFallback>
                  {suggestion.full_name?.[0] || suggestion.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {suggestion.full_name || suggestion.username || 'Unknown User'}
                </p>
                {suggestion.handicap !== null && (
                  <p className="text-xs text-muted-foreground">
                    Handicap: {suggestion.handicap}
                  </p>
                )}
              </div>
              <FriendRequestButton userId={suggestion.id} size="sm" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};