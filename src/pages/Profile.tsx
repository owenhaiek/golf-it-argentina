
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ProfileCard from "@/components/profile/ProfileCard";
import RecentRounds from "@/components/profile/RecentRounds";
import { User } from "lucide-react";

const Profile = () => {
  // Core state and hooks
  const { user } = useAuth();

  // Profile Query - Fetch user profile data
  const {
    data: profile,
    isLoading: profileLoading
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
    enabled: !!user?.id
  });

  // Rounds Query - Fetch user's recent rounds
  const {
    data: rounds,
    isLoading: roundsLoading
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
            holes,
            image_url,
            address,
            city,
            state,
            par
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
    enabled: !!user?.id
  });

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="flex items-center mb-6 gap-2 px-4">
        <User className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-bold text-primary">Your Profile</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 px-0">
        <div className="lg:col-span-4">
          <ProfileCard user={user} profile={profile} profileLoading={profileLoading} />
        </div>
        
        <div className="lg:col-span-8">
          <RecentRounds userId={user?.id} rounds={rounds} roundsLoading={roundsLoading} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
