
import { useProfileQueries } from "@/hooks/useProfileQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Calendar, MapPin, Star, Eye } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import RecentRounds from "./RecentRounds";

const ProfileContent = () => {
  const { profile, rounds } = useProfileQueries();
  const navigate = useNavigate();

  const totalRoundsPlayed = rounds?.length || 0;
  const averageScore = rounds?.length
    ? rounds.reduce((sum, round) => sum + round.score, 0) / rounds.length
    : 0;

  const lastPlayedCourse = rounds?.[0]?.golf_courses?.name || "N/A";
  const lastPlayedDate = rounds?.[0]?.date
    ? format(new Date(rounds[0].date), "MMM d, yyyy")
    : "N/A";

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              Total Rounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRoundsPlayed}</div>
            <p className="text-sm text-muted-foreground">Rounds Played</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Avg. Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageScore.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Last Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{lastPlayedDate}</div>
            <p className="text-sm text-muted-foreground">
              <MapPin className="inline-block h-4 w-4 mr-1" />
              {lastPlayedCourse}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rounds */}
      <RecentRounds />
    </div>
  );
};

export default ProfileContent;
