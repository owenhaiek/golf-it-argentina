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
  const { user } = useAuth();
  const { friends } = useFriendsData();

  const { data: suggestions, isLoading, refetch } = useQuery({
    queryKey: ['friendSuggestions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get current friend IDs
      const friendIds = friends.map(friend => friend.id);
      
      // Get users who are not already friends and not the current user
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, handicap')
        .not('id', 'in', `(${[user.id, ...friendIds].join(',')})`)
        .not('full_name', 'is', null)
        .limit(4)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as SuggestedUser[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Suggested Friends
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div 
            key={suggestion.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-card to-card/50 hover:from-accent/20 hover:to-accent/10 transition-all duration-200 animate-in slide-in-from-right-3"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage src={suggestion.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-medium">
                  {suggestion.full_name?.charAt(0) || 
                   suggestion.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {suggestion.full_name || suggestion.username || 'Unknown User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{suggestion.username || 'user'}
                  {suggestion.handicap !== null && (
                    <span className="ml-2">• Handicap: {suggestion.handicap}</span>
                  )}
                </p>
              </div>
            </div>
            
            <FriendRequestButton userId={suggestion.id} size="sm" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};