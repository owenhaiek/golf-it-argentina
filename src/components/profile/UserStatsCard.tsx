
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Flag, Star } from "lucide-react";

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
}

const UserStatsCard = ({ rounds, roundsLoading }: UserStatsCardProps) => {
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

  if (roundsLoading) {
    return (
      <Card className="mx-4 sm:mx-0 overflow-hidden">
        <CardHeader className="pb-4 px-4 sm:px-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardTitle className="text-lg sm:text-xl font-bold text-center">Player Statistics</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 animate-pulse">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                </div>
                <div className="text-center space-y-2">
                  <div className="h-6 w-16 bg-muted rounded mx-auto" />
                  <div className="h-4 w-20 bg-muted rounded mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <Card className="mx-4 sm:mx-0 overflow-hidden">
        <CardHeader className="pb-4 px-4 sm:px-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardTitle className="text-lg sm:text-xl font-bold text-center">Player Statistics</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 px-4 sm:px-6">
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-8">
            <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-sm sm:text-base font-medium">No statistics available yet</p>
            <p className="text-muted-foreground/70 text-xs sm:text-sm mt-1">Start playing to see your stats!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const totalRounds = rounds.length;
  
  // Calculate average vs par
  let totalScoreVsPar = 0;
  rounds.forEach(round => {
    const roundPar = calculateRoundPar(round);
    totalScoreVsPar += (round.score - roundPar);
  });
  const averageVsPar = totalScoreVsPar / totalRounds;

  // Find best round (lowest score relative to par)
  const bestRound = rounds.reduce((min, round) => {
    const minVsPar = min.score - calculateRoundPar(min);
    const roundVsPar = round.score - calculateRoundPar(round);
    return roundVsPar < minVsPar ? round : min;
  }, rounds[0]);

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
      hoverEffect: "hover:from-blue-500/20 hover:to-blue-600/10"
    },
    {
      icon: TrendingUp,
      label: "Avg vs Par",
      value: averageVsPar > 0 ? `+${averageVsPar.toFixed(1)}` : averageVsPar.toFixed(1),
      subtitle: averageVsPar > 0 ? "Over Par" : averageVsPar < 0 ? "Under Par" : "At Par",
      color: averageVsPar > 0 ? "text-red-600 dark:text-red-400" : averageVsPar < 0 ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400",
      bgGradient: averageVsPar > 0 ? "from-red-500/10 to-red-600/5" : averageVsPar < 0 ? "from-green-500/10 to-green-600/5" : "from-blue-500/10 to-blue-600/5",
      iconBg: averageVsPar > 0 ? "bg-red-500/10" : averageVsPar < 0 ? "bg-green-500/10" : "bg-blue-500/10",
      hoverEffect: averageVsPar > 0 ? "hover:from-red-500/20 hover:to-red-600/10" : averageVsPar < 0 ? "hover:from-green-500/20 hover:to-green-600/10" : "hover:from-blue-500/20 hover:to-blue-600/10"
    },
    {
      icon: Star,
      label: "Best Round",
      value: bestRoundVsPar > 0 ? `+${bestRoundVsPar}` : bestRoundVsPar.toString(),
      subtitle: bestRoundVsPar > 0 ? "Over Par" : bestRoundVsPar < 0 ? "Under Par" : "At Par",
      color: bestRoundVsPar > 0 ? "text-red-600 dark:text-red-400" : bestRoundVsPar < 0 ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400",
      bgGradient: bestRoundVsPar > 0 ? "from-red-500/10 to-red-600/5" : bestRoundVsPar < 0 ? "from-green-500/10 to-green-600/5" : "from-blue-500/10 to-blue-600/5",
      iconBg: bestRoundVsPar > 0 ? "bg-red-500/10" : bestRoundVsPar < 0 ? "bg-green-500/10" : "bg-blue-500/10",
      hoverEffect: bestRoundVsPar > 0 ? "hover:from-red-500/20 hover:to-red-600/10" : bestRoundVsPar < 0 ? "hover:from-green-500/20 hover:to-green-600/10" : "hover:from-blue-500/20 hover:to-blue-600/10"
    }
  ];

  return (
    <Card className="mx-4 sm:mx-0 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4 px-4 sm:px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
        <CardTitle className="text-lg sm:text-xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Player Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-br ${stat.bgGradient} ${stat.hoverEffect} rounded-xl p-4 sm:p-5 transition-all duration-300 transform hover:scale-105 hover:shadow-md cursor-pointer border border-border/20`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${stat.iconBg} rounded-full flex items-center justify-center transition-transform duration-300 hover:rotate-12`}>
                  <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.color} transition-colors duration-300`} />
                </div>
                
                <div className="space-y-1">
                  <div className={`text-xl sm:text-2xl font-bold ${stat.color} transition-colors duration-300`}>
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-foreground/80">
                    {stat.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional visual separator */}
        <div className="mt-6 pt-4 border-t border-border/20">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground/60">
            <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
