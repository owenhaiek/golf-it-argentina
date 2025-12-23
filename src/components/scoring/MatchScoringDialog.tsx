import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/hooks/useTournamentsAndMatches";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Swords, Flag } from "lucide-react";
import { motion } from "framer-motion";

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
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

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
        name: match.creator?.full_name || 'Creador',
        username: match.creator?.username || 'creator',
        avatar_url: match.creator?.avatar_url,
        hole_scores: new Array(18).fill(0),
        total_score: 0,
      },
      {
        user_id: match.opponent_id || "",
        name: match.opponent?.full_name || 'Oponente',
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
        title: "Puntajes Guardados",
        description: "Los puntajes del partido han sido guardados.",
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

  const activePlayer = players[activePlayerIndex];
  const totalPar = coursePars.reduce((a, b) => a + b, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0 bg-background border-border/50 max-h-[60vh] sm:max-h-[65vh] overflow-hidden mx-4 rounded-2xl">
        {/* Header */}
        <div className="p-4 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold truncate">{match?.name || "Partido"}</DialogTitle>
              <p className="text-xs text-muted-foreground">Cargar puntajes</p>
            </div>
          </div>
        </div>
        
        {/* Player Tabs */}
        <div className="flex border-b border-border/50">
          {players.map((player, index) => (
            <motion.button
              key={player.user_id}
              onClick={() => setActivePlayerIndex(index)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 transition-colors ${
                activePlayerIndex === index 
                  ? 'bg-red-500/10 border-b-2 border-red-500' 
                  : 'hover:bg-muted/50'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={player.avatar_url} />
                <AvatarFallback className="text-xs bg-red-500/20 text-red-600">
                  {player.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left min-w-0">
                <p className="text-xs font-medium truncate">{player.name?.split(' ')[0]}</p>
                <p className="text-[10px] text-muted-foreground">
                  Total: {player.total_score || 0}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        <ScrollArea className="flex-1 max-h-[30vh]">
          <div className="p-4">
            {activePlayer && (
              <div className="space-y-4">
                {/* Front 9 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-medium">Front 9</Label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {coursePars.slice(0, 9).map((par, holeIndex) => (
                      <div key={holeIndex} className="text-center bg-muted/30 rounded-xl p-2">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1 px-1">
                          <span>H{holeIndex + 1}</span>
                          <span>P{par}</span>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          max="15"
                          value={activePlayer.hole_scores[holeIndex] || ''}
                          onChange={(e) => updateHoleScore(activePlayerIndex, holeIndex, parseInt(e.target.value) || 0)}
                          className="text-center h-9 text-sm font-medium bg-background border-0 focus-visible:ring-red-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Back 9 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-medium">Back 9</Label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {coursePars.slice(9, 18).map((par, holeIndex) => (
                      <div key={holeIndex + 9} className="text-center bg-muted/30 rounded-xl p-2">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1 px-1">
                          <span>H{holeIndex + 10}</span>
                          <span>P{par}</span>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          max="15"
                          value={activePlayer.hole_scores[holeIndex + 9] || ''}
                          onChange={(e) => updateHoleScore(activePlayerIndex, holeIndex + 9, parseInt(e.target.value) || 0)}
                          className="text-center h-9 text-sm font-medium bg-background border-0 focus-visible:ring-red-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Summary & Actions */}
        <div className="p-4 border-t border-border/50 bg-background space-y-3">
          {/* Score Summary */}
          <div className="flex justify-between items-center bg-muted/30 rounded-xl p-3">
            <div className="flex items-center gap-4">
              {players.map((player, index) => (
                <div key={player.user_id} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={player.avatar_url} />
                    <AvatarFallback className="text-[10px]">{player.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <Badge variant={index === 0 ? "default" : "secondary"} className="text-sm">
                    {player.total_score || 0}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Par {totalPar}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl"
            >
              Cancelar
            </Button>
            <Button 
              onClick={submitScores} 
              disabled={loading}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
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
      </DialogContent>
    </Dialog>
  );
};