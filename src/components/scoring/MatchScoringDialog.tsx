import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/hooks/useTournamentsAndMatches";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Swords, Flag, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [activeHoleIndex, setActiveHoleIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  useEffect(() => {
    if (open && match?.id) {
      initializePlayers();
      fetchCoursePars();
      setActiveHoleIndex(0);
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
    updatedPlayers[playerIndex].hole_scores[holeIndex] = Math.max(0, score);
    updatedPlayers[playerIndex].total_score = updatedPlayers[playerIndex].hole_scores.reduce((sum, s) => sum + s, 0);
    setPlayers(updatedPlayers);
  };

  const adjustScore = (playerIndex: number, holeIndex: number, delta: number) => {
    const currentScore = players[playerIndex].hole_scores[holeIndex] || 0;
    updateHoleScore(playerIndex, holeIndex, currentScore + delta);
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

  const goToPrevHole = () => setActiveHoleIndex(prev => Math.max(0, prev - 1));
  const goToNextHole = () => setActiveHoleIndex(prev => Math.min(17, prev + 1));

  const totalPar = coursePars.reduce((a, b) => a + b, 0);
  const currentPar = coursePars[activeHoleIndex] || 4;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh] bg-background border-border/50">
        {/* Header */}
        <DrawerHeader className="p-3 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <Swords className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <DrawerTitle className="text-sm font-bold truncate">{match?.name || "Partido"}</DrawerTitle>
                <p className="text-xs text-muted-foreground">Cargar puntajes</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('single')}
                className="h-7 text-[10px] px-2"
              >
                Por hoyo
              </Button>
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('all')}
                className="h-7 text-[10px] px-2"
              >
                Todos
              </Button>
            </div>
          </div>
        </DrawerHeader>

        {viewMode === 'single' ? (
          <>
            {/* Hole Navigation */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevHole}
                disabled={activeHoleIndex === 0}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <motion.div 
                key={activeHoleIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-red-500" />
                  <span className="text-lg font-bold">Hoyo {activeHoleIndex + 1}</span>
                </div>
                <Badge variant="secondary" className="text-xs">Par {currentPar}</Badge>
              </motion.div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextHole}
                disabled={activeHoleIndex === 17}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Hole Indicators */}
            <div className="px-3 py-2 border-b border-border/50">
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {Array.from({ length: 18 }, (_, i) => {
                  const hasScore = players.some(p => p.hole_scores[i] > 0);
                  const isActive = i === activeHoleIndex;
                  return (
                    <motion.button
                      key={i}
                      onClick={() => setActiveHoleIndex(i)}
                      className={`flex-shrink-0 w-7 h-7 rounded-full text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-red-500 text-white scale-110' 
                          : hasScore 
                            ? 'bg-green-500/20 text-green-600 border border-green-500/50' 
                            : 'bg-muted/50 text-muted-foreground'
                      }`}
                      whileTap={{ scale: 0.9 }}
                    >
                      {i + 1}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Single Hole Score Input */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeHoleIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {players.map((player, playerIndex) => (
                    <div key={player.user_id} className="bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={player.avatar_url} />
                            <AvatarFallback className="text-xs bg-red-500/20 text-red-600">
                              {player.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{player.name?.split(' ')[0]}</p>
                            <p className="text-[10px] text-muted-foreground">Total: {player.total_score}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => adjustScore(playerIndex, activeHoleIndex, -1)}
                          disabled={player.hole_scores[activeHoleIndex] <= 0}
                          className="h-12 w-12 rounded-full"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max="15"
                            value={player.hole_scores[activeHoleIndex] || ''}
                            onChange={(e) => updateHoleScore(playerIndex, activeHoleIndex, parseInt(e.target.value) || 0)}
                            className="text-center h-16 w-20 text-2xl font-bold bg-background border-2 border-red-500/30 focus-visible:ring-red-500 rounded-xl"
                          />
                          {player.hole_scores[activeHoleIndex] > 0 && (
                            <Badge 
                              className={`absolute -top-2 -right-2 text-[10px] ${
                                player.hole_scores[activeHoleIndex] < currentPar 
                                  ? 'bg-green-500' 
                                  : player.hole_scores[activeHoleIndex] === currentPar 
                                    ? 'bg-blue-500' 
                                    : 'bg-orange-500'
                              }`}
                            >
                              {player.hole_scores[activeHoleIndex] - currentPar === 0 
                                ? 'E' 
                                : player.hole_scores[activeHoleIndex] - currentPar > 0 
                                  ? `+${player.hole_scores[activeHoleIndex] - currentPar}` 
                                  : player.hole_scores[activeHoleIndex] - currentPar}
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => adjustScore(playerIndex, activeHoleIndex, 1)}
                          className="h-12 w-12 rounded-full"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        ) : (
          <>
            {/* All Holes View - Scrollable */}
            <div className="overflow-y-auto flex-1 max-h-[40vh] p-3">
              {players.map((player, playerIndex) => (
                <div key={player.user_id} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={player.avatar_url} />
                      <AvatarFallback className="text-[10px] bg-red-500/20 text-red-600">
                        {player.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{player.name?.split(' ')[0]}</span>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      Total: {player.total_score}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-1">
                    {coursePars.map((par, holeIndex) => (
                      <div 
                        key={holeIndex} 
                        className={`text-center bg-muted/30 rounded-lg p-1 cursor-pointer transition-all ${
                          activeHoleIndex === holeIndex ? 'ring-2 ring-red-500' : ''
                        }`}
                        onClick={() => {
                          setActiveHoleIndex(holeIndex);
                          setViewMode('single');
                        }}
                      >
                        <div className="text-[8px] text-muted-foreground">H{holeIndex + 1}</div>
                        <Input
                          type="number"
                          min="0"
                          max="15"
                          value={player.hole_scores[holeIndex] || ''}
                          onChange={(e) => updateHoleScore(playerIndex, holeIndex, parseInt(e.target.value) || 0)}
                          className="text-center h-6 text-xs font-medium bg-background border-0 focus-visible:ring-red-500 p-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Summary & Actions */}
        <div className="p-3 border-t border-border/50 bg-background space-y-2">
          {/* Score Summary */}
          <div className="flex justify-between items-center bg-muted/30 rounded-lg p-2">
            <div className="flex items-center gap-3">
              {players.map((player, index) => (
                <div key={player.user_id} className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={player.avatar_url} />
                    <AvatarFallback className="text-[9px]">{player.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs h-5">
                    {player.total_score || 0}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Par {totalPar}
            </div>
          </div>
          
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
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm"
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