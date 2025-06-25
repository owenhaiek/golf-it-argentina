
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trophy, Calendar, Loader2, Eye, Plus, Minus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Round {
  id: string;
  user_id: string;
  course_id: string;
  date: string;
  score: number;
  notes?: string;
  created_at: string;
  golf_courses?: {
    name: string;
    par?: number;
    image_url?: string;
    hole_pars?: number[];
  };
}

interface UserRecentRoundsProps {
  rounds: Round[];
  roundsLoading: boolean;
}

const UserRecentRounds = ({ rounds, roundsLoading }: UserRecentRoundsProps) => {
  const navigate = useNavigate();

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
        <CardHeader>
          <CardTitle className="text-lg">Recent Rounds</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Rounds</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No rounds recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Rounds</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rounds.map((round) => {
          const coursePar = calculateRoundPar(round);
          const scoreDiff = round.score - coursePar;
          
          let scoreStatus;
          let scoreColor;
          let ScoreIcon;
          
          if (scoreDiff < 0) {
            scoreStatus = `${Math.abs(scoreDiff)} under par`;
            scoreColor = "text-green-600";
            ScoreIcon = Minus;
          } else if (scoreDiff > 0) {
            scoreStatus = `${scoreDiff} over par`;
            scoreColor = "text-red-600";
            ScoreIcon = Plus;
          } else {
            scoreStatus = "At par";
            scoreColor = "text-blue-600";
            ScoreIcon = Check;
          }

          return (
            <Card key={round.id} className="relative overflow-hidden">
              {round.golf_courses?.image_url && (
                <div className="h-32 bg-cover bg-center relative">
                  <img 
                    src={round.golf_courses.image_url} 
                    alt={round.golf_courses.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg leading-tight">
                      {round.golf_courses?.name || "Unknown Course"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(round.date), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/course/${round.course_id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Score:</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {round.score}
                    </Badge>
                  </div>
                  
                  <div className={`flex items-center gap-1 ${scoreColor}`}>
                    <ScoreIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{scoreStatus}</span>
                  </div>
                </div>

                {round.notes && (
                  <div className="mt-3 p-2 bg-muted rounded text-sm">
                    <strong>Notes:</strong> {round.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {rounds.length >= 5 && (
          <div className="text-center">
            <Button variant="link">View All Rounds</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRecentRounds;
