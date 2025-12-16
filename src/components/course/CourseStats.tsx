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
  
  const calculateRoundPar = (round: Round) => {
    if (round.notes && round.notes.includes('9 holes played')) {
      if (courseHolePars && courseHolePars.length >= 18) {
        if (round.notes.includes('(front 9)')) {
          return courseHolePars.slice(0, 9).reduce((a, b) => a + b, 0);
        } else if (round.notes.includes('(back 9)')) {
          return courseHolePars.slice(9, 18).reduce((a, b) => a + b, 0);
        }
      }
      return Math.round(coursePar / 2);
    }
    return coursePar;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-2xl p-4 animate-pulse">
              <div className="h-16 bg-zinc-800 rounded-xl"></div>
            </div>
          ))}
        </div>
        <div className="bg-zinc-900 rounded-2xl p-6 animate-pulse">
          <div className="h-32 bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-zinc-900 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white">{t("course", "courseStatistics")}</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-14 w-14 text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">{t("course", "noRoundsRecorded")}</h3>
            <p className="text-zinc-400 text-sm max-w-md">
              {t("course", "firstToPlayCourse")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalRounds = rounds.length;
  
  let totalScoreVsPar = 0;
  rounds.forEach(round => {
    const roundPar = calculateRoundPar(round);
    totalScoreVsPar += (round.score - roundPar);
  });
  const averageVsPar = totalScoreVsPar / totalRounds;

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

  const uniquePlayers = new Set(rounds.map(round => round.user_id)).size;

  const sortedRounds = [...rounds].sort((a, b) => {
    const aVsPar = a.score - calculateRoundPar(a);
    const bVsPar = b.score - calculateRoundPar(b);
    return aVsPar - bVsPar;
  });

  const bestRoundPar = calculateRoundPar(bestRound);
  const worstRoundPar = calculateRoundPar(worstRound);

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Rounds */}
        <div className="bg-zinc-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalRounds}</p>
          <p className="text-xs sm:text-sm text-zinc-400">{t("course", "totalRounds")}</p>
        </div>

        {/* Average vs Par */}
        <div className="bg-zinc-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-bold mb-1 ${
            averageVsPar > 0 ? 'text-red-400' : averageVsPar < 0 ? 'text-emerald-400' : 'text-blue-400'
          }`}>
            {averageVsPar > 0 ? `+${averageVsPar.toFixed(1)}` : averageVsPar.toFixed(1)}
          </p>
          <p className="text-xs sm:text-sm text-zinc-400">{t("course", "averageVsPar")}</p>
        </div>

        {/* Best Round */}
        <div className="bg-zinc-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Target className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-bold mb-1 ${
            bestRound.score - bestRoundPar > 0 ? 'text-red-400' : bestRound.score - bestRoundPar < 0 ? 'text-emerald-400' : 'text-blue-400'
          }`}>
            {bestRound.score - bestRoundPar > 0 ? `+${bestRound.score - bestRoundPar}` : bestRound.score - bestRoundPar}
          </p>
          <p className="text-xs sm:text-sm text-zinc-400">{t("course", "bestRound")}</p>
        </div>

        {/* Players */}
        <div className="bg-zinc-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{uniquePlayers}</p>
          <p className="text-xs sm:text-sm text-zinc-400">{t("course", "players")}</p>
        </div>
      </div>

      {/* Best Round Showcase */}
      <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Award className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-white">{t("course", "bestRound")}</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-emerald-500/30">
            <AvatarImage 
              src={bestRound.profiles?.avatar_url || ''} 
              alt={bestRound.profiles?.username || 'Anonymous'} 
            />
            <AvatarFallback className="bg-zinc-800 text-emerald-400 text-lg font-semibold">
              {bestRound.profiles?.username?.charAt(0).toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {bestRound.score}
              </span>
              <div className={`px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${
                bestRound.score - bestRoundPar < 0 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : bestRound.score - bestRoundPar === 0
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {bestRound.score - bestRoundPar > 0 ? `+${bestRound.score - bestRoundPar}` : bestRound.score - bestRoundPar}
              </div>
            </div>
            <div className="text-white font-medium text-sm sm:text-base truncate">
              {bestRound.profiles?.username || 'Anonymous Player'}
            </div>
            <div className="text-zinc-400 text-xs sm:text-sm">
              {format(new Date(bestRound.date), "d MMM yyyy")} • Par {bestRoundPar}
            </div>
          </div>
        </div>
        
        {bestRound.notes && (
          <div className="mt-4 bg-zinc-800/50 p-3 rounded-xl">
            <p className="text-sm text-zinc-300 italic">
              "{bestRound.notes}"
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <CourseLeaderboard rounds={sortedRounds} isLoading={false} coursePar={coursePar} />
    </div>
  );
};

export default CourseStats;