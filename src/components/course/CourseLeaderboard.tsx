import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, User } from "lucide-react";
import { format } from "date-fns";

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
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 text-center text-muted-foreground">{i}</div>
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-4 w-12 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rounds.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Trophy className="h-12 w-12 mb-2 opacity-20" />
          <p>No scores recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {rounds.map((round, index) => {
            const scoreDiff = coursePar ? round.score - coursePar : 0;
            const scoreLabel = scoreDiff === 0 
              ? "E" 
              : scoreDiff > 0 
                ? `+${scoreDiff}` 
                : scoreDiff.toString();
            
            return (
              <div key={round.id} className="flex items-center gap-3">
                <div className="w-6 text-center text-muted-foreground">{index + 1}</div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={round.profiles?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {(round.profiles?.username || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{round.profiles?.username || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(round.date), "MM/dd/yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{round.score}</p>
                  <p className={`text-xs ${
                    scoreDiff < 0 ? 'text-green-600' : scoreDiff > 0 ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {scoreLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseLeaderboard;
