import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp, Flag, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  const { data: allRounds, isLoading: allRoundsLoading } = useQuery({
    queryKey: ['allRoundsForStats', userId],
    queryFn: async () => {
      if (!userId) return rounds;
      const { data, error } = await supabase
        .from('rounds')
        .select(`*, golf_courses (name, hole_pars, holes, image_url, address, city, state, par)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000
  });

  const roundsForStats = userId ? allRounds || rounds : rounds;
  const isLoadingStats = userId ? allRoundsLoading || roundsLoading : roundsLoading;

  const calculateRoundPar = (round: Round) => {
    const fullCoursePar = round.golf_courses?.par || 72;
    if (round.notes && round.notes.includes('9 holes played')) {
      if (round.golf_courses?.hole_pars && round.golf_courses.hole_pars.length >= 18) {
        if (round.notes.includes('(front 9)')) {
          return round.golf_courses.hole_pars.slice(0, 9).reduce((a, b) => a + b, 0);
        } else if (round.notes.includes('(back 9)')) {
          return round.golf_courses.hole_pars.slice(9, 18).reduce((a, b) => a + b, 0);
        }
      }
      return Math.round(fullCoursePar / 2);
    }
    return fullCoursePar;
  };

  if (isLoadingStats) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-zinc-900 border-0">
            <CardContent className="p-4 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 animate-pulse mb-3" />
              <div className="h-6 w-12 bg-zinc-800 animate-pulse rounded mb-2" />
              <div className="h-4 w-16 bg-zinc-800 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!roundsForStats || roundsForStats.length === 0) {
    return (
      <Card className="bg-zinc-900 border-0">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-zinc-500" />
          </div>
          <p className="text-zinc-400 text-sm">{t("profile", "noStatsAvailable")}</p>
        </CardContent>
      </Card>
    );
  }

  const totalRounds = roundsForStats.length;
  let totalScoreVsPar = 0;
  roundsForStats.forEach(round => {
    totalScoreVsPar += round.score - calculateRoundPar(round);
  });
  const averageVsPar = totalScoreVsPar / totalRounds;

  const bestRound = roundsForStats.reduce((min, round) => {
    const minVsPar = min.score - calculateRoundPar(min);
    const roundVsPar = round.score - calculateRoundPar(round);
    return roundVsPar < minVsPar ? round : min;
  }, roundsForStats[0]);
  const bestRoundVsPar = bestRound.score - calculateRoundPar(bestRound);

  const stats = [
    {
      icon: Flag,
      value: totalRounds.toString(),
      label: "Rondas Totales",
      bgColor: "bg-blue-500/20",
      iconColor: "text-blue-400",
      valueColor: "text-blue-400"
    },
    {
      icon: TrendingUp,
      value: averageVsPar > 0 ? `+${averageVsPar.toFixed(1)}` : averageVsPar.toFixed(1),
      label: "Prom. vs Par",
      bgColor: averageVsPar <= 0 ? "bg-green-500/20" : "bg-red-500/20",
      iconColor: averageVsPar <= 0 ? "text-green-400" : "text-red-400",
      valueColor: averageVsPar <= 0 ? "text-green-400" : "text-red-400"
    },
    {
      icon: Star,
      value: bestRoundVsPar > 0 ? `+${bestRoundVsPar}` : bestRoundVsPar.toString(),
      label: "Mejor Ronda",
      bgColor: bestRoundVsPar <= 0 ? "bg-green-500/20" : "bg-amber-500/20",
      iconColor: bestRoundVsPar <= 0 ? "text-green-400" : "text-amber-400",
      valueColor: bestRoundVsPar <= 0 ? "text-green-400" : "text-amber-400"
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-zinc-900 border-0 overflow-hidden">
          <CardContent className="p-4 flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center mb-3`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <span className={`text-2xl font-bold ${stat.valueColor}`}>
              {stat.value}
            </span>
            <span className="text-xs text-zinc-500 mt-1 text-center">
              {stat.label}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserStatsCard;
