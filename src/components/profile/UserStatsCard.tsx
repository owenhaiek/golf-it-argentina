
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Flag, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Round {
  id: string;
  score: number;
  notes?: string;
  golf_courses?: {
    par?: number;
    hole_pars?: number[];
  };
}

interface UserStatsCardProps {
  rounds: Round[];
  roundsLoading: boolean;
  userId?: string;
}

const UserStatsCard = ({ rounds, roundsLoading, userId }: UserStatsCardProps) => {
  // Query to fetch ALL rounds for accurate statistics (when userId is provided)
  const {
    data: allRounds,
    isLoading: allRoundsLoading
  } = useQuery({
    queryKey: ['allRoundsForStats', userId],
    queryFn: async () => {
      if (!userId) return rounds;
      
      console.log("Fetching all rounds for statistics calculation");
      
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("All rounds fetch error for stats:", error);
        throw error;
      }
      
      console.log("All rounds fetched for stats:", data?.length || 0);
      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Use all rounds for statistics if available, otherwise use provided rounds
  const roundsForStats = userId ? (allRounds || rounds) : rounds;
  const isLoadingStats = userId ? (allRoundsLoading || roundsLoading) : roundsLoading;

  // Helper function to calculate the correct par for a round
  const calculateRoundPar = (round: Round) => {
    const fullCoursePar = round.golf_courses?.par || 72;
    
    // Check if this is a 9-hole round from the notes
    if (round.notes && round.notes.includes('9 holes played')) {
      if (round.golf_courses?.hole_pars && round.golf_courses.hole_pars.length >= 18) {
        // Calculate front 9 or back 9 par based on notes
        if (round.notes.includes('(front 9)')) {
          return round.golf_courses.hole_pars.slice(0, 9).reduce((a, b) => a + b, 0);
        } else if (round.notes.includes('(back 9)')) {
          return round.golf_courses.hole_pars.slice(9, 18).reduce((a, b) => a + b, 0);
        }
      }
      // Fallback: assume 9 holes is half the course par
      return Math.round(fullCoursePar / 2);
    }
    
    return fullCoursePar;
  };

  if (isLoadingStats) {
    return (
      <Card className="mx-4 sm:mx-0 overflow-hidden shadow-lg">
        <CardHeader className="pb-4 px-4 sm:px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
          <CardTitle className="text-lg sm:text-xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 sm:p-5 animate-pulse">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="h-6 w-16 bg-muted rounded mx-auto" />
                    <div className="h-4 w-20 bg-muted rounded mx-auto" />
                    <div className="h-3 w-16 bg-muted rounded mx-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!roundsForStats || roundsForStats.length === 0) {
    return (
      <Card className="mx-4 sm:mx-0 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4 px-4 sm:px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
          <CardTitle className="text-lg sm:text-xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 px-4 sm:px-6">
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-8 hover:from-muted/60 hover:to-muted/40 transition-all duration-300">
            <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-sm sm:text-base font-medium">No statistics available yet</p>
            <p className="text-muted-foreground/70 text-xs sm:text-sm mt-1">Start playing to see your stats!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics using all rounds
  const totalRounds = roundsForStats.length;
  
  // Calculate average vs par
  let totalScoreVsPar = 0;
  roundsForStats.forEach(round => {
    const roundPar = calculateRoundPar(round);
    totalScoreVsPar += (round.score - roundPar);
  });
  const averageVsPar = totalScoreVsPar / totalRounds;

  // Find best round (lowest score relative to par)
  const bestRound = roundsForStats.reduce((min, round) => {
    const minVsPar = min.score - calculateRoundPar(min);
    const roundVsPar = round.score - calculateRoundPar(round);
    return roundVsPar < minVsPar ? round : min;
  }, roundsForStats[0]);

  const bestRoundPar = calculateRoundPar(bestRound);
  const bestRoundVsPar = bestRound.score - bestRoundPar;

  const stats = [
    {
      icon: Flag,
      label: "Total Rounds",
      value: totalRounds.toString(),
      subtitle: "Rounds Played",
      color: "text-blue-600 dark:text-blue-400",
      bgGradient: "from-blue-500/10 to-blue-600/5",
      iconBg: "bg-blue-500/10",
      hoverEffect: "hover:from-blue-500/20 hover:to-blue-600/10",
      pulseColor: "bg-blue-500/30"
    },
    {
      icon: TrendingUp,
      label: "Avg vs Par",
      value: averageVsPar > 0 ? `+${averageVsPar.toFixed(1)}` : averageVsPar.toFixed(1),
      subtitle: averageVsPar > 0 ? "Over Par" : averageVsPar < 0 ? "Under Par" : "At Par",
      color: averageVsPar > 0 ? "text-red-600 dark:text-red-400" : averageVsPar < 0 ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400",
      bgGradient: averageVsPar > 0 ? "from-red-500/10 to-red-600/5" : averageVsPar < 0 ? "from-green-500/10 to-green-600/5" : "from-blue-500/10 to-blue-600/5",
      iconBg: averageVsPar > 0 ? "bg-red-500/10" : averageVsPar < 0 ? "bg-green-500/10" : "bg-blue-500/10",
      hoverEffect: averageVsPar > 0 ? "hover:from-red-500/20 hover:to-red-600/10" : averageVsPar < 0 ? "hover:from-green-500/20 hover:to-green-600/10" : "hover:from-blue-500/20 hover:to-blue-600/10",
      pulseColor: averageVsPar > 0 ? "bg-red-500/30" : averageVsPar < 0 ? "bg-green-500/30" : "bg-blue-500/30"
    },
    {
      icon: Star,
      label: "Best Round",
      value: bestRoundVsPar > 0 ? `+${bestRoundVsPar}` : bestRoundVsPar.toString(),
      subtitle: bestRoundVsPar > 0 ? "Over Par" : bestRoundVsPar < 0 ? "Under Par" : "At Par",
      color: bestRoundVsPar > 0 ? "text-red-600 dark:text-red-400" : bestRoundVsPar < 0 ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400",
      bgGradient: bestRoundVsPar > 0 ? "from-red-500/10 to-red-600/5" : bestRoundVsPar < 0 ? "from-green-500/10 to-green-600/5" : "from-blue-500/10 to-blue-600/5",
      iconBg: bestRoundVsPar > 0 ? "bg-red-500/10" : bestRoundVsPar < 0 ? "bg-green-500/10" : "bg-blue-500/10",
      hoverEffect: bestRoundVsPar > 0 ? "hover:from-red-500/20 hover:to-red-600/10" : bestRoundVsPar < 0 ? "hover:from-green-500/20 hover:to-green-600/10" : "hover:from-blue-500/20 hover:to-blue-600/10",
      pulseColor: bestRoundVsPar > 0 ? "bg-red-500/30" : bestRoundVsPar < 0 ? "bg-green-500/30" : "bg-blue-500/30"
    }
  ];

  return (
    <Card className="mx-4 sm:mx-0 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50">
      <CardHeader className="pb-4 px-4 sm:px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse opacity-50" />
        <CardTitle className="text-lg sm:text-xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent relative z-10">
          Player Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-br ${stat.bgGradient} ${stat.hoverEffect} rounded-xl p-4 sm:p-5 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer border border-border/20 group relative overflow-hidden`}
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${stat.iconBg} rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 relative overflow-hidden`}>
                  {/* Icon pulse effect */}
                  <div className={`absolute inset-0 ${stat.pulseColor} rounded-full animate-ping opacity-20 group-hover:opacity-40`} />
                  <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.color} transition-all duration-300 relative z-10 group-hover:drop-shadow-sm`} />
                </div>
                
                <div className="space-y-1">
                  <div className={`text-xl sm:text-2xl font-bold ${stat.color} transition-all duration-300 group-hover:scale-110`}>
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-300">
                    {stat.label}
                  </div>
                  <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
                    {stat.subtitle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced visual separator */}
        <div className="mt-6 pt-4 border-t border-gradient-to-r from-transparent via-border to-transparent">
          <div className="flex items-center justify-center space-x-2">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`w-2 h-2 ${stat.pulseColor} rounded-full animate-pulse`}
                style={{ animationDelay: `${index * 0.2}s` }}
              />
            ))}
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground/60">
              Based on {totalRounds} round{totalRounds !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
