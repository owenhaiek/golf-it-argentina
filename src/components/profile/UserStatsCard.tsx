
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
      <Card className="mx-4 sm:mx-0">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Player Statistics</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full mx-auto mb-2" />
                <div className="h-3 w-8 bg-muted rounded mx-auto mb-1" />
                <div className="h-2 w-6 bg-muted rounded mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <Card className="mx-4 sm:mx-0">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Player Statistics</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-4 px-4 sm:px-6">
          <Trophy className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-xs sm:text-sm">No statistics available yet</p>
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
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      icon: TrendingUp,
      label: "Avg vs Par",
      value: averageVsPar > 0 ? `+${averageVsPar.toFixed(1)}` : averageVsPar.toFixed(1),
      color: averageVsPar > 0 ? "text-red-600 dark:text-red-400" : averageVsPar < 0 ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400",
      bgColor: averageVsPar > 0 ? "bg-red-50 dark:bg-red-950" : averageVsPar < 0 ? "bg-green-50 dark:bg-green-950" : "bg-blue-50 dark:bg-blue-950"
    },
    {
      icon: Star,
      label: "Best Round",
      value: bestRoundVsPar > 0 ? `+${bestRoundVsPar}` : bestRoundVsPar.toString(),
      color: bestRoundVsPar > 0 ? "text-red-600 dark:text-red-400" : bestRoundVsPar < 0 ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400",
      bgColor: bestRoundVsPar > 0 ? "bg-red-50 dark:bg-red-950" : bestRoundVsPar < 0 ? "bg-green-50 dark:bg-green-950" : "bg-blue-50 dark:bg-blue-950"
    }
  ];

  return (
    <Card className="mx-4 sm:mx-0">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg">Player Statistics</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
              <div className={`text-sm sm:text-lg font-bold ${stat.color} mb-1 leading-tight`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
