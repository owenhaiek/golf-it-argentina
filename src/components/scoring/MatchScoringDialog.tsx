import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/hooks/useTournamentsAndMatches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MatchScoringDialogProps {
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

export const MatchScoringDialog = ({ match, open, onOpenChange, onSuccess }: MatchScoringDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<PlayerScore[]>([]);
  const [coursePars, setCoursePars] = useState<number[]>([]);

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
        .eq('id', match.course_id)
        .single();

      if (error) throw error;
      setCoursePars(data.hole_pars || new Array(18).fill(4));
    } catch (error) {
      console.error('Error fetching course pars:', error);
      setCoursePars(new Array(18).fill(4));
    }
  };

  const updateHoleScore = (playerIndex: number, holeIndex: number, score: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex].hole_scores[holeIndex] = score;
    updatedPlayers[playerIndex].total_score = updatedPlayers[playerIndex].hole_scores.reduce((sum, s) => sum + s, 0);
    setPlayers(updatedPlayers);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Match Scoring - {match?.name || "Loading..."}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {players.map((player, playerIndex) => (
            <Card key={player.user_id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={player.avatar_url} />
                    <AvatarFallback>{player.name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-muted-foreground">@{player.username}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-9 gap-2 mb-4">
                  {/* Front 9 */}
                  {coursePars.slice(0, 9).map((par, holeIndex) => (
                    <div key={holeIndex} className="text-center">
                      <Label className="text-xs">Hole {holeIndex + 1}</Label>
                      <div className="text-xs text-muted-foreground">Par {par}</div>
                      <Input
                        type="number"
                        min="1"
                        max="15"
                        value={player.hole_scores[holeIndex] || ''}
                        onChange={(e) => updateHoleScore(playerIndex, holeIndex, parseInt(e.target.value) || 0)}
                        className="text-center h-8"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-9 gap-2 mb-4">
                  {/* Back 9 */}
                  {coursePars.slice(9, 18).map((par, holeIndex) => (
                    <div key={holeIndex + 9} className="text-center">
                      <Label className="text-xs">Hole {holeIndex + 10}</Label>
                      <div className="text-xs text-muted-foreground">Par {par}</div>
                      <Input
                        type="number"
                        min="1"
                        max="15"
                        value={player.hole_scores[holeIndex + 9] || ''}
                        onChange={(e) => updateHoleScore(playerIndex, holeIndex + 9, parseInt(e.target.value) || 0)}
                        className="text-center h-8"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total Score:</span>
                  <Badge variant="outline" className="text-lg">
                    {player.total_score || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={submitScores} disabled={loading}>
              {loading ? "Submitting..." : "Submit Scores"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};