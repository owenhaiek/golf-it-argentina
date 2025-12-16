import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface Round {
  id: string;
  score: number;
  date: string;
  user_id: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface CourseLeaderboardProps {
  rounds: Round[];
  isLoading: boolean;
  coursePar?: number;
}

const CourseLeaderboard = ({ rounds, isLoading, coursePar = 72 }: CourseLeaderboardProps) => {
  const { t } = useLanguage();

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
        </div>;
      case 2:
        return <div className="w-6 h-6 rounded-full bg-zinc-400/20 flex items-center justify-center">
          <Medal className="w-3.5 h-3.5 text-zinc-300" />
        </div>;
      case 3:
        return <div className="w-6 h-6 rounded-full bg-orange-600/20 flex items-center justify-center">
          <Medal className="w-3.5 h-3.5 text-orange-400" />
        </div>;
      default:
        return <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
          <span className="text-xs font-medium text-zinc-400">{position}</span>
        </div>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Leaderboard</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl animate-pulse">
              <div className="w-6 h-6 rounded-full bg-zinc-700" />
              <div className="w-10 h-10 rounded-full bg-zinc-700" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-zinc-700 rounded mb-1" />
                <div className="h-3 w-16 bg-zinc-700 rounded" />
              </div>
              <div className="h-5 w-10 bg-zinc-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Leaderboard</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Trophy className="h-12 w-12 text-zinc-600 mb-3" />
          <p className="text-zinc-400 text-sm">No hay puntuaciones registradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-amber-400" />
        </div>
        <h3 className="text-base font-semibold text-white">Leaderboard</h3>
      </div>
      
      <div className="space-y-2">
        {rounds.map((round, index) => {
          const scoreDiff = coursePar ? round.score - coursePar : 0;
          const scoreLabel = scoreDiff === 0 
            ? "E" 
            : scoreDiff > 0 
              ? `+${scoreDiff}` 
              : scoreDiff.toString();
          
          const isTopThree = index < 3;
          
          return (
            <div 
              key={round.id} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                isTopThree ? 'bg-zinc-800/70' : 'bg-zinc-800/30 hover:bg-zinc-800/50'
              }`}
            >
              {getPositionIcon(index + 1)}
              
              <Avatar className={`h-9 w-9 sm:h-10 sm:w-10 ${isTopThree ? 'ring-2 ring-zinc-700' : ''}`}>
                <AvatarImage src={round.profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-zinc-700 text-zinc-300 text-sm">
                  {(round.profiles?.username || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm sm:text-base truncate">
                  {round.profiles?.username || "Anónimo"}
                </p>
                <p className="text-xs text-zinc-500">
                  {format(new Date(round.date), "d MMM yyyy")}
                </p>
              </div>
              
              <div className="text-right flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-white">{round.score}</span>
                <span className={`text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full ${
                  scoreDiff < 0 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : scoreDiff > 0 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {scoreLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseLeaderboard;