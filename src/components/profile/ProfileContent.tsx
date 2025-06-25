
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

  // Helper function to calculate the correct par for a round
  const calculateRoundPar = (round: any) => {
    const fullCoursePar = round.golf_courses?.par || 72;
    
    // Check if this is a 9-hole round from the notes
    if (round.notes && round.notes.includes('9 holes played')) {
      if (round.golf_courses?.hole_pars && round.golf_courses.hole_pars.length >= 18) {
        // Calculate front 9 or back 9 par based on notes
        if (round.notes.includes('(front 9)')) {
          return round.golf_courses.hole_pars.slice(0, 9).reduce((a: number, b: number) => a + b, 0);
        } else if (round.notes.includes('(back 9)')) {
          return round.golf_courses.hole_pars.slice(9, 18).reduce((a: number, b: number) => a + b, 0);
        }
      }
      // Fallback: assume 9 holes is half the course par
      return Math.round(fullCoursePar / 2);
    }
    
    return fullCoursePar;
  };

  const totalRoundsPlayed = rounds?.length || 0;
  
  // Calculate average score relative to par
  let totalScoreVsPar = 0;
  if (rounds && rounds.length > 0) {
    rounds.forEach(round => {
      const roundPar = calculateRoundPar(round);
      totalScoreVsPar += (round.score - roundPar);
    });
  }
  const averageVsPar = rounds?.length ? totalScoreVsPar / rounds.length : 0;

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
              Avg vs Par
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${averageVsPar > 0 ? 'text-red-600' : averageVsPar < 0 ? 'text-green-600' : 'text-blue-600'}`}>
              {averageVsPar > 0 ? `+${averageVsPar.toFixed(1)}` : averageVsPar.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Average vs Par</p>
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
