import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProfileData } from "@/hooks/useProfileData";
import ProfileCard from "@/components/profile/ProfileCard";
import RecentRounds from "@/components/profile/RecentRounds";
import UserStatsCard from "@/components/profile/UserStatsCard";
import { FriendsSection } from "@/components/profile/FriendsSection";
import { FriendSuggestions } from "@/components/profile/FriendSuggestions";
import { TournamentsAndMatchesSection } from "@/components/profile/TournamentsAndMatchesSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, loading } = useAuth();
  const { profile, profileLoading, rounds, roundsLoading } = useProfileData();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Prefetch tournaments and matches data
  useEffect(() => {
    if (user?.id) {
      // Prefetch tournaments
      queryClient.prefetchQuery({
        queryKey: ['userTournaments', user.id],
        queryFn: async () => {
          const { data } = await supabase
            .from('tournaments')
            .select(`
              *,
              golf_courses (name, city, state),
              tournament_participants (id, user_id, status, profiles (full_name, username, avatar_url))
            `)
            .or(`creator_id.eq.${user.id},tournament_participants.user_id.eq.${user.id}`)
            .order('start_date', { ascending: false });
          return data || [];
        },
        staleTime: 1000 * 60 * 5,
      });

      // Prefetch matches
      queryClient.prefetchQuery({
        queryKey: ['userMatches', user.id],
        queryFn: async () => {
          const { data: matchesData } = await supabase
            .from('matches')
            .select(`*, golf_courses (name, city, state)`)
            .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
            .order('match_date', { ascending: false });

          if (!matchesData) return [];

          const userIds = new Set<string>();
          matchesData.forEach(match => {
            userIds.add(match.creator_id);
            userIds.add(match.opponent_id);
          });

          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', Array.from(userIds));

          const profilesMap = new Map();
          profilesData?.forEach(profile => profilesMap.set(profile.id, profile));

          return matchesData.map(match => ({
            ...match,
            creator: profilesMap.get(match.creator_id) || null,
            opponent: profilesMap.get(match.opponent_id) || null,
          }));
        },
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [user?.id, queryClient]);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 touch-none"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{t("common", "profile")}</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/settings')} 
            className="rounded-full bg-muted/50 hover:bg-muted/70 transition-colors"
          >
            <Settings size={16} className="text-muted-foreground" />
          </Button>
        </div>
      </motion.div>
      
      <div className="flex-1">
        <div className="p-4 space-y-6 pb-28">
          <ProfileCard 
            user={user} 
            profile={profile || {}} 
            profileLoading={profileLoading} 
          />
          <UserStatsCard 
            rounds={rounds || []}
            roundsLoading={roundsLoading}
            userId={user.id}
          />
          <TournamentsAndMatchesSection />
          <RecentRounds />
        </div>
      </div>
    </div>
  );
};

export default Profile;
