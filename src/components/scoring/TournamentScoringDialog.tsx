import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tournament } from "@/hooks/useTournamentsAndMatches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TournamentScoringDialogProps {
  tournament: Tournament;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ParticipantScore {
  participant_id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  hole_scores: number[];
  total_score: number;
}

export const TournamentScoringDialog = ({ tournament, open, onOpenChange, onSuccess }: TournamentScoringDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<ParticipantScore[]>([]);
  const [coursePars, setCoursePars] = useState<number[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);

  useEffect(() => {
    if (open && tournament?.id) {
      fetchParticipants();
      fetchCoursePars();
    }
  }, [open, tournament?.id]);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select(`
          id,
          user_id,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('tournament_id', tournament.id)
        .eq('status', 'registered');

      if (error) throw error;

      const participantScores: ParticipantScore[] = (data || []).map((p: any) => ({
        participant_id: p.id,
        user_id: p.user_id,
        username: p.profiles?.username || 'Unknown',
        full_name: p.profiles?.full_name || 'Unknown Player',
        avatar_url: p.profiles?.avatar_url,
        hole_scores: new Array(18).fill(0),
        total_score: 0,
      }));

      setParticipants(participantScores);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tournament participants.",
        variant: "destructive",
      });
    }
  };

  const fetchCoursePars = async () => {
    try {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('hole_pars')
        .eq('id', tournament.course_id)
        .single();

      if (error) throw error;
      setCoursePars(data.hole_pars || new Array(18).fill(4));
    } catch (error) {
      console.error('Error fetching course pars:', error);
      setCoursePars(new Array(18).fill(4));
    }
  };

  const updateHoleScore = (participantIndex: number, holeIndex: number, score: number) => {
    const updatedParticipants = [...participants];
    updatedParticipants[participantIndex].hole_scores[holeIndex] = score;
    updatedParticipants[participantIndex].total_score = updatedParticipants[participantIndex].hole_scores.reduce((sum, s) => sum + s, 0);
    setParticipants(updatedParticipants);
  };

  const submitScores = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const scores = participants.map(p => ({
        tournament_id: tournament.id,
        participant_id: p.participant_id,
        round_number: roundNumber,
        hole_scores: p.hole_scores,
        total_score: p.total_score,
        submitted_by: user.id,
      }));

      const { error } = await supabase
        .from('tournament_scores')
        .upsert(scores, {
          onConflict: 'tournament_id,participant_id,round_number'
        });

      if (error) throw error;

      toast({
        title: "Scores Submitted",
        description: `Round ${roundNumber} scores have been submitted successfully.`,
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
          <DialogTitle className="flex items-center gap-2">
            Tournament Scoring - {tournament?.name || "Loading..."}
            <Badge variant="secondary">Round {roundNumber}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="round">Round Number:</Label>
            <Input
              id="round"
              type="number"
              min="1"
              max="4"
              value={roundNumber}
              onChange={(e) => setRoundNumber(parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>

          <div className="grid gap-4">
            {participants.map((participant, participantIndex) => (
              <Card key={participant.participant_id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {participant.full_name} (@{participant.username})
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
                          value={participant.hole_scores[holeIndex] || ''}
                          onChange={(e) => updateHoleScore(participantIndex, holeIndex, parseInt(e.target.value) || 0)}
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
                          value={participant.hole_scores[holeIndex + 9] || ''}
                          onChange={(e) => updateHoleScore(participantIndex, holeIndex + 9, parseInt(e.target.value) || 0)}
                          className="text-center h-8"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Total Score:</span>
                    <Badge variant="outline" className="text-lg">
                      {participant.total_score || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
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