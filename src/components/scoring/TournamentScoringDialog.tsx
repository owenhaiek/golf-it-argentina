import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tournament } from "@/hooks/useTournamentsAndMatches";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

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
  const [activeParticipantIndex, setActiveParticipantIndex] = useState(0);

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
        full_name: p.profiles?.full_name || 'Jugador',
        avatar_url: p.profiles?.avatar_url,
        hole_scores: new Array(18).fill(0),
        total_score: 0,
      }));

      setParticipants(participantScores);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los participantes.",
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
        title: "Puntajes Guardados",
        description: `Los puntajes de la ronda ${roundNumber} han sido guardados.`,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting scores:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los puntajes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeParticipant = participants[activeParticipantIndex];
  const totalPar = coursePars.reduce((a, b) => a + b, 0);

  const goToPrevParticipant = () => {
    setActiveParticipantIndex(prev => Math.max(0, prev - 1));
  };

  const goToNextParticipant = () => {
    setActiveParticipantIndex(prev => Math.min(participants.length - 1, prev + 1));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[75vh] bg-background border-border/50">
        {/* Header */}
        <DrawerHeader className="p-3 pb-2 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-sm font-bold truncate">{tournament?.name || "Torneo"}</DrawerTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="text-[10px] h-5">Ronda {roundNumber}</Badge>
                <Input
                  type="number"
                  min="1"
                  max="4"
                  value={roundNumber}
                  onChange={(e) => setRoundNumber(parseInt(e.target.value) || 1)}
                  className="w-12 h-5 text-xs text-center p-1"
                />
              </div>
            </div>
          </div>
        </DrawerHeader>
        
        {/* Participant Navigation */}
        {participants.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevParticipant}
              disabled={activeParticipantIndex === 0}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <motion.div 
              key={activeParticipantIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={activeParticipant?.avatar_url} />
                <AvatarFallback className="text-xs bg-amber-500/20 text-amber-600">
                  {activeParticipant?.full_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-xs font-medium">{activeParticipant?.full_name}</p>
                <p className="text-[9px] text-muted-foreground">
                  {activeParticipantIndex + 1} de {participants.length} • Total: {activeParticipant?.total_score || 0}
                </p>
              </div>
            </motion.div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextParticipant}
              disabled={activeParticipantIndex === participants.length - 1}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 max-h-[30vh]">
          <div className="p-3">
            {activeParticipant && (
              <div className="space-y-3">
                {/* Front 9 */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Flag className="h-3.5 w-3.5 text-primary" />
                    <Label className="text-xs font-medium">Front 9</Label>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {coursePars.slice(0, 9).map((par, holeIndex) => (
                      <div key={holeIndex} className="text-center bg-muted/30 rounded-lg p-1.5">
                        <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5 px-0.5">
                          <span>H{holeIndex + 1}</span>
                          <span>P{par}</span>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          max="15"
                          value={activeParticipant.hole_scores[holeIndex] || ''}
                          onChange={(e) => updateHoleScore(activeParticipantIndex, holeIndex, parseInt(e.target.value) || 0)}
                          className="text-center h-8 text-sm font-medium bg-background border-0 focus-visible:ring-amber-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Back 9 */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Flag className="h-3.5 w-3.5 text-primary" />
                    <Label className="text-xs font-medium">Back 9</Label>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {coursePars.slice(9, 18).map((par, holeIndex) => (
                      <div key={holeIndex + 9} className="text-center bg-muted/30 rounded-lg p-1.5">
                        <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5 px-0.5">
                          <span>H{holeIndex + 10}</span>
                          <span>P{par}</span>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          max="15"
                          value={activeParticipant.hole_scores[holeIndex + 9] || ''}
                          onChange={(e) => updateHoleScore(activeParticipantIndex, holeIndex + 9, parseInt(e.target.value) || 0)}
                          className="text-center h-8 text-sm font-medium bg-background border-0 focus-visible:ring-amber-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary & Actions */}
        <div className="p-3 border-t border-border/50 bg-background space-y-2">
          {/* Leaderboard Summary */}
          {participants.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground mb-1.5">Tabla de posiciones</p>
              <div className="flex flex-wrap gap-1.5">
                {[...participants]
                  .sort((a, b) => (a.total_score || 999) - (b.total_score || 999))
                  .slice(0, 4)
                  .map((p, index) => (
                    <div key={p.participant_id} className="flex items-center gap-1">
                      <span className="text-[10px] font-medium text-muted-foreground">{index + 1}.</span>
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={p.avatar_url} />
                        <AvatarFallback className="text-[7px]">{p.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                        {p.total_score || 0}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 rounded-xl text-sm"
            >
              Cancelar
            </Button>
            <Button 
              onClick={submitScores} 
              disabled={loading}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Guardando
                </div>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};