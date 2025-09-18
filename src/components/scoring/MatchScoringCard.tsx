import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/hooks/useTournamentsAndMatches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Trophy, Swords } from "lucide-react";
import ScoreInput from "@/components/rounds/ScoreInput";
import HoleVisualization from "@/components/rounds/HoleVisualization";
import ScoreSummary from "@/components/rounds/ScoreSummary";

interface MatchScoringCardProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PlayerScore {
  user_id: string;
  name: string;
  username: string;
  avatar_url?: string;
  hole_scores: number[];
  total_score: number;
}

export const MatchScoringCard = ({ match, open, onOpenChange, onSuccess }: MatchScoringCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<PlayerScore[]>([]);
  const [coursePars, setCoursePars] = useState<number[]>([]);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  useEffect(() => {
    if (open && match?.id) {
      initializePlayers();
      fetchCoursePars();
    }
  }, [open, match?.id]);

  const initializePlayers = () => {
    if (!match) return;
    
    const playerScores: PlayerScore[] = [
      {
        user_id: match.creator_id || "",
        name: match.creator?.full_name || 'Creator',
        username: match.creator?.username || 'creator',
        avatar_url: match.creator?.avatar_url,
        hole_scores: new Array(18).fill(0),
        total_score: 0,
      },
      {
        user_id: match.opponent_id || "",
        name: match.opponent?.full_name || 'Opponent',
        username: match.opponent?.username || 'opponent',
        avatar_url: match.opponent?.avatar_url,
        hole_scores: new Array(18).fill(0),
        total_score: 0,
      }
    ];
    setPlayers(playerScores);
  };

  const fetchCoursePars = async () => {
    try {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('hole_pars')
        .eq('id', match?.course_id)
        .maybeSingle();

      if (error) throw error;
      setCoursePars(data?.hole_pars || new Array(18).fill(4));
    } catch (error) {
      console.error('Error fetching course pars:', error);
      setCoursePars(new Array(18).fill(4));
    }
  };

  const currentPlayer = players[currentPlayerIndex];
  const currentPar = coursePars[currentHoleIndex] || 4;
  const currentScore = currentPlayer?.hole_scores[currentHoleIndex] || 0;
  const completedHoles = currentPlayer?.hole_scores.filter(score => score > 0).length || 0;

  const getScoreColor = (score: number, par: number): string => {
    if (score === 0) return 'text-muted-foreground';
    const diff = score - par;
    if (diff < 0) return 'text-green-500 dark:text-green-400';
    if (diff === 0) return 'text-blue-500 dark:text-blue-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getScoreTerm = (score: number, par: number): string => {
    if (score === 0) return '';
    const diff = score - par;
    if (diff === -2) return 'Eagle';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double Bogey';
    if (diff > 2) return 'Triple+';
    return '';
  };

  const incrementScore = () => {
    if (!currentPlayer) return;
    const newPlayers = [...players];
    const newScore = (newPlayers[currentPlayerIndex].hole_scores[currentHoleIndex] || 0) + 1;
    newPlayers[currentPlayerIndex].hole_scores[currentHoleIndex] = Math.min(newScore, 15);
    newPlayers[currentPlayerIndex].total_score = newPlayers[currentPlayerIndex].hole_scores.reduce((sum, s) => sum + s, 0);
    setPlayers(newPlayers);
  };

  const decrementScore = () => {
    if (!currentPlayer) return;
    const newPlayers = [...players];
    const currentScore = newPlayers[currentPlayerIndex].hole_scores[currentHoleIndex] || 0;
    if (currentScore > 0) {
      newPlayers[currentPlayerIndex].hole_scores[currentHoleIndex] = currentScore - 1;
      newPlayers[currentPlayerIndex].total_score = newPlayers[currentPlayerIndex].hole_scores.reduce((sum, s) => sum + s, 0);
      setPlayers(newPlayers);
    }
  };

  const goToNextHole = () => {
    if (currentScore === 0) {
      toast({
        title: "Enter a score",
        description: "Please enter a score for this hole before proceeding.",
        variant: "destructive"
      });
      return;
    }

    if (currentHoleIndex < 17) {
      setCurrentHoleIndex(currentHoleIndex + 1);
    } else {
      // Switch to next player or complete round
      if (currentPlayerIndex < players.length - 1) {
        setCurrentPlayerIndex(currentPlayerIndex + 1);
        setCurrentHoleIndex(0);
        toast({
          title: "Player switch",
          description: `Now entering scores for ${players[currentPlayerIndex + 1]?.name}`,
        });
      } else {
        toast({
          title: "Round Complete!",
          description: "All players have completed their rounds. Ready to submit scores.",
        });
      }
    }
  };

  const goToPreviousHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1);
    } else if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(currentPlayerIndex - 1);
      setCurrentHoleIndex(17);
    }
  };

  const submitScores = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const scores = players.map(p => ({
        match_id: match.id,
        user_id: p.user_id,
        hole_scores: p.hole_scores,
        total_score: p.total_score,
        submitted_by: user.id,
      }));

      const { error } = await supabase
        .from('match_scores')
        .upsert(scores, {
          onConflict: 'match_id,user_id'
        });

      if (error) throw error;

      // Determine winner and update match
      const winner = players.reduce((prev, current) => 
        (current.total_score < prev.total_score && current.total_score > 0) ? current : prev
      );

      if (winner.total_score > 0) {
        await supabase
          .from('matches')
          .update({ 
            winner_id: winner.user_id,
            status: 'completed'
          })
          .eq('id', match.id);
      }

      toast({
        title: "Scores Submitted",
        description: "Match scores have been submitted successfully.",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting scores:', error);
      toast({
        title: "Error",
        description: "Failed to submit scores. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAllPlayersComplete = players.every(player => 
    player.hole_scores.every(score => score > 0)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Swords className="h-5 w-5 text-red-500" />
            {match?.name || "Match Scoring"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 space-y-4">
          {/* Current Player Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentPlayer?.avatar_url} />
                  <AvatarFallback>{currentPlayer?.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{currentPlayer?.name}</div>
                  <div className="text-sm text-muted-foreground">{currentPlayer?.username}</div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedHoles}/18 holes</span>
            </div>
            <Progress value={(completedHoles / 18) * 100} className="h-2" />
          </div>

          {/* Course Name */}
          <div className="text-center">
            <h2 className="text-lg font-semibold">{match?.golf_courses?.name || 'Course'}</h2>
          </div>

          {/* Score Summary */}
          <ScoreSummary
            currentTotal={currentPlayer?.total_score || 0}
            totalPar={coursePars.slice(0, completedHoles).reduce((sum, par) => sum + par, 0)}
            vsParScore={(currentPlayer?.total_score || 0) - coursePars.slice(0, completedHoles).reduce((sum, par) => sum + par, 0)}
          />

          {/* Hole Visualization */}
          <HoleVisualization
            currentHoleIndex={currentHoleIndex}
            holeOffset={0}
            currentPar={currentPar}
            currentScore={currentScore}
          />

          {/* Score Input */}
          <ScoreInput
            currentScore={currentScore}
            onIncrement={incrementScore}
            onDecrement={decrementScore}
            scoreColor={getScoreColor(currentScore, currentPar)}
            scoreTerm={getScoreTerm(currentScore, currentPar)}
          />

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={goToPreviousHole}
              disabled={currentHoleIndex === 0 && currentPlayerIndex === 0}
              className="flex-1 h-12"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={goToNextHole}
              disabled={!currentScore}
              className="flex-1 h-12"
            >
              {currentHoleIndex < 17 ? (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : currentPlayerIndex < players.length - 1 ? (
                <>
                  Next Player
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Complete
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Submit Button */}
          {isAllPlayersComplete && (
            <div className="pt-4 border-t">
              <Button 
                onClick={submitScores} 
                disabled={loading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {loading ? "Submitting..." : (
                  <>
                    <Trophy className="mr-2 h-5 w-5" />
                    Submit Match Results
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="pb-4" />
        </div>
      </DialogContent>
    </Dialog>
  );
};