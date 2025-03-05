
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ProfileCard from "@/components/profile/ProfileCard";
import RecentRounds from "@/components/profile/RecentRounds";

const Profile = () => {
  // Core state and hooks
  const { user } = useAuth();
  
  // Profile Query - Fetch user profile data
  const { 
    data: profile, 
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Rounds Query - Fetch user's recent rounds
  const { 
    data: rounds, 
    isLoading: roundsLoading,
  } = useQuery({
    queryKey: ['rounds', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          golf_courses (
            name,
            hole_pars,
            holes
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Rounds fetch error:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <ProfileCard 
        user={user} 
        profile={profile} 
        profileLoading={profileLoading} 
      />
      
      <RecentRounds 
        userId={user?.id} 
        rounds={rounds} 
        roundsLoading={roundsLoading} 
      />
    </div>
  );
};

export default Profile;
