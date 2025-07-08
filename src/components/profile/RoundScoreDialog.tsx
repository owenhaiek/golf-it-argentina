
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Flag, Plus, Minus, Check, X } from "lucide-react";
import { format } from "date-fns";

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

interface RoundScoreDialogProps {
  round: Round | null;
  isOpen: boolean;
  onClose: () => void;
}

const RoundScoreDialog = ({ round, isOpen, onClose }: RoundScoreDialogProps) => {
  const [selectedHole, setSelectedHole] = useState(0);

  if (!round) return null;

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

  // Get hole pars and number of holes
  const getHoleData = () => {
    if (!round.golf_courses?.hole_pars) {
      // Default 18 holes with par 72
      return Array(18).fill(4);
    }

    if (round.notes && round.notes.includes('9 holes played')) {
      if (round.notes.includes('(front 9)')) {
        return round.golf_courses.hole_pars.slice(0, 9);
      } else if (round.notes.includes('(back 9)')) {
        return round.golf_courses.hole_pars.slice(9, 18);
      }
      // Default to front 9
      return round.golf_courses.hole_pars.slice(0, 9);
    }

    return round.golf_courses.hole_pars;
  };

  const holePars = getHoleData();
  const numberOfHoles = holePars.length;
  
  // Since we don't have individual hole scores stored, we'll simulate them
  // In a real implementation, you'd store hole-by-hole scores
  const generateSimulatedScores = () => {
    const totalScore = round.score;
    const totalPar = holePars.reduce((a, b) => a + b, 0);
    const averageOverUnder = (totalScore - totalPar) / numberOfHoles;
    
    return holePars.map((par, index) => {
      const baseScore = par + Math.round(averageOverUnder);
      // Consistent scores based on par and average performance
      return Math.max(1, baseScore);
    });
  };

  const holeScores = generateSimulatedScores();
  const coursePar = calculateRoundPar(round);
  const scoreDiff = round.score - coursePar;

  const getScoreStatus = (score: number, par: number) => {
    const diff = score - par;
    if (diff < 0) return { term: 'Birdie', color: 'text-green-600', icon: Minus };
    if (diff === 0) return { term: 'Par', color: 'text-blue-600', icon: Check };
    if (diff === 1) return { term: 'Bogey', color: 'text-red-600', icon: Plus };
    return { term: 'Double+', color: 'text-red-600', icon: Plus };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-0 top-0 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl font-bold text-center pr-8">
            Round Scorecard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Round Info Header */}
          <Card>
            <CardContent className="p-4">
              {/* Course Image */}
              {round.golf_courses?.image_url && (
                <div className="mb-4">
                  <img 
                    src={round.golf_courses.image_url} 
                    alt={round.golf_courses.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {round.golf_courses?.name || "Unknown Course"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(round.date), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary" className="text-lg font-bold">
                      {round.score}
                    </Badge>
                  </div>
                  <div className={`text-sm font-medium ${
                    scoreDiff > 0 ? 'text-red-600' : scoreDiff < 0 ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} vs Par
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hole-by-Hole Scores */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Hole-by-Hole Scores
              </h4>
              
              {/* Desktop View - Table */}
              <div className="hidden md:block">
                <div className="grid grid-cols-10 gap-2 text-sm">
                  <div className="font-medium text-muted-foreground">Hole</div>
                  {Array.from({ length: Math.min(9, numberOfHoles) }, (_, i) => (
                    <div key={i} className="text-center font-medium">
                      {i + 1}
                    </div>
                  ))}
                  
                  <div className="font-medium text-muted-foreground">Par</div>
                  {holePars.slice(0, 9).map((par, i) => (
                    <div key={i} className="text-center text-muted-foreground">
                      {par}
                    </div>
                  ))}
                  
                  <div className="font-medium text-muted-foreground">Score</div>
                  {holeScores.slice(0, 9).map((score, i) => {
                    const par = holePars[i];
                    const status = getScoreStatus(score, par);
                    return (
                      <div key={i} className={`text-center font-bold ${status.color}`}>
                        {score}
                      </div>
                    );
                  })}
                </div>

                {numberOfHoles > 9 && (
                  <div className="grid grid-cols-10 gap-2 text-sm mt-4 pt-4 border-t">
                    <div className="font-medium text-muted-foreground">Hole</div>
                    {Array.from({ length: numberOfHoles - 9 }, (_, i) => (
                      <div key={i} className="text-center font-medium">
                        {i + 10}
                      </div>
                    ))}
                    
                    <div className="font-medium text-muted-foreground">Par</div>
                    {holePars.slice(9).map((par, i) => (
                      <div key={i} className="text-center text-muted-foreground">
                        {par}
                      </div>
                    ))}
                    
                    <div className="font-medium text-muted-foreground">Score</div>
                    {holeScores.slice(9).map((score, i) => {
                      const par = holePars[i + 9];
                      const status = getScoreStatus(score, par);
                      return (
                        <div key={i} className={`text-center font-bold ${status.color}`}>
                          {score}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mobile View - Cards */}
              <div className="md:hidden space-y-3">
                {holeScores.map((score, index) => {
                  const par = holePars[index];
                  const status = getScoreStatus(score, par);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Flag className="h-4 w-4 text-primary" />
                        <span className="font-medium">Hole {index + 1}</span>
                        <span className="text-sm text-muted-foreground">Par {par}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${status.color} border-current`}>
                          {score}
                        </Badge>
                        <div className={`flex items-center gap-1 ${status.color}`}>
                          <status.icon className="h-3 w-3" />
                          <span className="text-xs font-medium">{status.term}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{numberOfHoles}</div>
                    <div className="text-sm text-muted-foreground">Holes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{coursePar}</div>
                    <div className="text-sm text-muted-foreground">Course Par</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${
                      scoreDiff > 0 ? 'text-red-600' : scoreDiff < 0 ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">vs Par</div>
                  </div>
                </div>
              </div>

              {round.notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <strong className="text-sm">Notes:</strong>
                  <p className="text-sm mt-1">{round.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoundScoreDialog;
