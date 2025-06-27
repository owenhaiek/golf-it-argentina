
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Calendar, Target } from "lucide-react";

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
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Player Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-2" />
                <div className="h-4 w-16 bg-muted rounded mx-auto mb-1" />
                <div className="h-3 w-12 bg-muted rounded mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Player Statistics</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No statistics available yet</p>
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
      icon: Calendar,
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
      icon: Target,
      label: "Best Round",
      value: bestRoundVsPar > 0 ? `+${bestRoundVsPar}` : bestRoundVsPar.toString(),
      color: bestRoundVsPar > 0 ? "text-red-600 dark:text-red-400" : bestRoundVsPar < 0 ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400",
      bgColor: bestRoundVsPar > 0 ? "bg-red-50 dark:bg-red-950" : bestRoundVsPar < 0 ? "bg-green-50 dark:bg-green-950" : "bg-blue-50 dark:bg-blue-950"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Player Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
              <div className={`text-lg sm:text-xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
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
