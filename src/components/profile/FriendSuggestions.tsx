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
  if (!suggestions || suggestions.length === 0) {
    return null;
  }
  return;
};