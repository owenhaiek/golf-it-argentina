import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Round {
  id: string;
  score: number;
  date: string;
  notes?: string;
}

interface CourseStatsProps {
  rounds: Round[];
  isLoading: boolean;
  coursePar?: number;
}

const CourseStats = ({ rounds, isLoading, coursePar = 72 }: CourseStatsProps) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Course Stats</CardTitle>
        </CardHeader>
        <CardContent>Loading stats...</CardContent>
      </Card>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Course Stats</CardTitle>
        </CardHeader>
        <CardContent>No rounds played at this course yet.</CardContent>
      </Card>
    );
  }

  const totalRounds = rounds.length;
  const totalScore = rounds.reduce((sum, round) => sum + round.score, 0);
  const averageScore = totalScore / totalRounds;
  const vsPar = averageScore - coursePar;

  // Calculate best and worst scores
  const bestRound = rounds.reduce((min, round) => (round.score < min.score ? round : min), rounds[0]);
  const worstRound = rounds.reduce((max, round) => (round.score > max.score ? round : max), rounds[0]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Course Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            <div>
              <p className="text-sm font-medium">Average Score</p>
              <p className="text-lg">{averageScore.toFixed(1)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-500" />
            <div>
              <p className="text-sm font-medium">vs Par</p>
              <p className="text-lg">{vsPar > 0 ? `+${vsPar.toFixed(1)}` : vsPar.toFixed(1)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Best Round</p>
              <p className="text-lg">
                {bestRound.score} ({format(new Date(bestRound.date), "MMM d, yyyy")})
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
            <div>
              <p className="text-sm font-medium">Worst Round</p>
              <p className="text-lg">
                {worstRound.score} ({format(new Date(worstRound.date), "MMM d, yyyy")})
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseStats;
