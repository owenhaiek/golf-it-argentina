
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

interface Round {
  id: string;
  score: number;
  date: string;
  created_at: string;
}

interface CourseStatsProps {
  rounds: Round[];
  isLoading: boolean;
  coursePar?: number | null;
}

export const CourseStats = ({ rounds, isLoading, coursePar = 72 }: CourseStatsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (rounds.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Stats</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <BarChart2 className="h-12 w-12 mb-2 opacity-20" />
          <p>Play a round to see your stats</p>
        </CardContent>
      </Card>
    );
  }

  const avgScore = rounds.reduce((sum, round) => sum + round.score, 0) / rounds.length;
  const bestScore = Math.min(...rounds.map(round => round.score));
  const bestScoreDiff = coursePar ? bestScore - coursePar : 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-md text-center">
            <p className="text-sm text-muted-foreground mb-1">Rounds Played</p>
            <p className="text-2xl font-bold">{rounds.length}</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-md text-center">
            <p className="text-sm text-muted-foreground mb-1">Average Score</p>
            <p className="text-2xl font-bold">{avgScore.toFixed(1)}</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-md text-center">
            <p className="text-sm text-muted-foreground mb-1">Best Score</p>
            <p className="text-2xl font-bold">{bestScore}</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-md text-center">
            <p className="text-sm text-muted-foreground mb-1">vs Par</p>
            <p className={`text-2xl font-bold ${
              bestScoreDiff < 0 ? 'text-green-600' : bestScoreDiff > 0 ? 'text-red-600' : 'text-blue-600'
            }`}>
              {bestScoreDiff === 0 ? 'E' : bestScoreDiff > 0 ? `+${bestScoreDiff}` : bestScoreDiff}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseStats;
