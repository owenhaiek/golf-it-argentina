
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Target, Calendar, Trophy, Users, Award, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import CourseLeaderboard from "./CourseLeaderboard";

interface Round {
  id: string;
  score: number;
  date: string;
  notes?: string;
  user_id: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface CourseStatsProps {
  rounds: Round[];
  isLoading: boolean;
  coursePar?: number;
  courseHolePars?: number[];
}

const CourseStats = ({ rounds, isLoading, coursePar = 72, courseHolePars }: CourseStatsProps) => {
  const { t } = useLanguage();
  // Helper function to calculate the correct par for a round
  const calculateRoundPar = (round: Round) => {
    // Check if this is a 9-hole round from the notes
    if (round.notes && round.notes.includes('9 holes played')) {
      if (courseHolePars && courseHolePars.length >= 18) {
        // Calculate front 9 or back 9 par based on notes
        if (round.notes.includes('(front 9)')) {
          return courseHolePars.slice(0, 9).reduce((a, b) => a + b, 0);
        } else if (round.notes.includes('(back 9)')) {
          return courseHolePars.slice(9, 18).reduce((a, b) => a + b, 0);
        }
      }
      // Fallback: assume 9 holes is half the course par
      return Math.round(coursePar / 2);
    }
    
    return coursePar;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-48 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {t("course", "courseStatistics")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("course", "noRoundsRecorded")}</h3>
            <p className="text-muted-foreground max-w-md">
              {t("course", "firstToPlayCourse")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRounds = rounds.length;
  
  // Calculate weighted average score considering different par values
  let totalScoreVsPar = 0;
  rounds.forEach(round => {
    const roundPar = calculateRoundPar(round);
    totalScoreVsPar += (round.score - roundPar);
  });
  const averageVsPar = totalScoreVsPar / totalRounds;

  // Calculate best and worst rounds with correct par calculations
  const bestRound = rounds.reduce((min, round) => {
    const minVsPar = min.score - calculateRoundPar(min);
    const roundVsPar = round.score - calculateRoundPar(round);
    return roundVsPar < minVsPar ? round : min;
  }, rounds[0]);

  const worstRound = rounds.reduce((max, round) => {
    const maxVsPar = max.score - calculateRoundPar(max);
    const roundVsPar = round.score - calculateRoundPar(round);
    return roundVsPar > maxVsPar ? round : max;
  }, rounds[0]);

  // Get unique players
  const uniquePlayers = new Set(rounds.map(round => round.user_id)).size;

  // Sort rounds for leaderboard (best scores relative to par first)
  const sortedRounds = [...rounds].sort((a, b) => {
    const aVsPar = a.score - calculateRoundPar(a);
    const bVsPar = b.score - calculateRoundPar(b);
    return aVsPar - bVsPar;
  });

  const bestRoundPar = calculateRoundPar(bestRound);
  const worstRoundPar = calculateRoundPar(worstRound);

  return (
    <div className="space-y-6">
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{t("course", "totalRounds")}</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalRounds}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">{t("course", "averageVsPar")}</p>
                <p className={`text-2xl font-bold ${averageVsPar > 0 ? 'text-red-600 dark:text-red-400' : averageVsPar < 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {averageVsPar > 0 ? `+${averageVsPar.toFixed(1)}` : averageVsPar.toFixed(1)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{t("course", "bestRound")}</p>
                <p className={`text-2xl font-bold ${bestRound.score - bestRoundPar > 0 ? 'text-red-600 dark:text-red-400' : bestRound.score - bestRoundPar < 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {bestRound.score - bestRoundPar > 0 ? `+${bestRound.score - bestRoundPar}` : bestRound.score - bestRoundPar}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{t("course", "players")}</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{uniquePlayers}</p>
              </div>
              <Users className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Round Showcase */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900">
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-emerald-900 dark:text-emerald-100">{t("course", "bestRound")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-emerald-200 dark:ring-emerald-800">
              <AvatarImage 
                src={bestRound.profiles?.avatar_url || ''} 
                alt={bestRound.profiles?.username || 'Anonymous'} 
              />
              <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-lg font-semibold">
                {bestRound.profiles?.username?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                  {bestRound.score}
                </span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  bestRound.score - bestRoundPar < 0 
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' 
                    : bestRound.score - bestRoundPar === 0
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                }`}>
                  {bestRound.score - bestRoundPar > 0 ? `+${bestRound.score - bestRoundPar}` : bestRound.score - bestRoundPar}
                </div>
              </div>
              <div className="text-emerald-700 dark:text-emerald-300 font-medium text-lg">
                {bestRound.profiles?.username || 'Anonymous Player'}
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 text-sm">
                {format(new Date(bestRound.date), "MMMM d, yyyy")} • Par {bestRoundPar}
              </div>
            </div>
          </div>
          {bestRound.notes && (
            <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 italic">
                "{bestRound.notes}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <CourseLeaderboard rounds={sortedRounds} isLoading={false} coursePar={coursePar} />
    </div>
  );
};

export default CourseStats;
