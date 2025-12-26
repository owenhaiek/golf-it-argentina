import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/hooks/useTournamentsAndMatches";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Swords, Flag, ChevronLeft, ChevronRight, Minus, Plus, ArrowLeft, ArrowRight, Check, Grid } from "lucide-react";
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
  isCurrentUser: boolean;
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
    if (!match || !user) return;
    
    const isCreator = user.id === match.creator_id;
    
    const playerScores: PlayerScore[] = [
      {
        user_id: match.creator_id || "",
        name: match.creator?.full_name || 'Creador',
        username: match.creator?.username || 'creator',
        avatar_url: match.creator?.avatar_url,
        hole_scores: new Array(18).fill(0),
        total_score: 0,
        isCurrentUser: isCreator,
      },
      {
        user_id: match.opponent_id || "",
        name: match.opponent?.full_name || 'Oponente',
        username: match.opponent?.username || 'opponent',
        avatar_url: match.opponent?.avatar_url,
        hole_scores: new Array(18).fill(0),
        total_score: 0,
        isCurrentUser: !isCreator,
      }
    ];
    
    // Sort so current user is first
    playerScores.sort((a, b) => (b.isCurrentUser ? 1 : 0) - (a.isCurrentUser ? 1 : 0));
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
  const isLastHole = activeHoleIndex >= 17;
  
  const currentPlayer = players[0];
  const opponentPlayer = players[1];

  const getScoreDiff = (score: number, par: number) => {
    if (score === 0) return '';
    const diff = score - par;
    if (diff === 0) return 'E';
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getScoreColor = (score: number, par: number) => {
    if (score === 0) return 'text-muted-foreground';
    const diff = score - par;
    if (diff < -1) return 'text-yellow-500'; // Eagle or better
    if (diff === -1) return 'text-green-500'; // Birdie
    if (diff === 0) return 'text-blue-500'; // Par
    if (diff === 1) return 'text-orange-500'; // Bogey
    return 'text-red-500'; // Double+
  };

  const getScoreBgColor = (score: number, par: number) => {
    if (score === 0) return 'bg-muted/50';
    const diff = score - par;
    if (diff < -1) return 'bg-yellow-500';
    if (diff === -1) return 'bg-green-500';
    if (diff === 0) return 'bg-blue-500';
    if (diff === 1) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMatchStatus = () => {
    if (!currentPlayer || !opponentPlayer) return null;
    
    const myTotal = currentPlayer.total_score;
    const opponentTotal = opponentPlayer.total_score;
    
    if (myTotal === 0 && opponentTotal === 0) return null;
    
    const diff = myTotal - opponentTotal;
    if (diff === 0) return { text: 'Empate', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (diff < 0) return { text: `Ganando por ${Math.abs(diff)}`, color: 'text-green-500', bg: 'bg-green-500/10' };
    return { text: `Perdiendo por ${diff}`, color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const matchStatus = getMatchStatus();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-background border-border/50">
        {/* Header */}
        <DrawerHeader className="p-3 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <Swords className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <DrawerTitle className="text-sm font-bold truncate">{match?.name || "Partido"}</DrawerTitle>
                <p className="text-xs text-muted-foreground">{match?.golf_courses?.name}</p>
              </div>
            </div>
            <Button
              variant={viewMode === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(viewMode === 'all' ? 'single' : 'all')}
              className="h-8 px-2"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        {viewMode === 'single' ? (
          <>
            {/* Hole Indicators - Scrollable horizontal */}
            <div className="px-3 py-2 border-b border-border/50 bg-muted/20">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {Array.from({ length: 18 }, (_, i) => {
                  const myScore = currentPlayer?.hole_scores[i] || 0;
                  const opponentScore = opponentPlayer?.hole_scores[i] || 0;
                  const hasAnyScore = myScore > 0 || opponentScore > 0;
                  const isActive = i === activeHoleIndex;
                  
                  return (
                    <motion.button
                      key={i}
                      onClick={() => setActiveHoleIndex(i)}
                      className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                        isActive 
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 scale-110' 
                          : hasAnyScore 
                            ? 'bg-green-500/20 text-green-600 border border-green-500/40' 
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                      }`}
                      whileTap={{ scale: 0.9 }}
                    >
                      {i + 1}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Current Hole Info */}
            <div className="px-4 py-3 bg-gradient-to-b from-muted/30 to-transparent">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeHoleIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-center gap-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                      <Flag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">Hoyo {activeHoleIndex + 1}</p>
                      <p className="text-xs text-muted-foreground">Par {currentPar}</p>
                    </div>
                  </div>
                  
                  {matchStatus && (
                    <Badge className={`${matchStatus.bg} ${matchStatus.color} border-0`}>
                      {matchStatus.text}
                    </Badge>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Score Input Section */}
            <div className="flex-1 px-4 py-2 space-y-3 overflow-y-auto max-h-[35vh]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeHoleIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {/* Current User Score */}
                  {currentPlayer && (
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                            <AvatarImage src={currentPlayer.avatar_url} />
                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                              {currentPlayer.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm flex items-center gap-1">
                              {currentPlayer.name?.split(' ')[0]}
                              <Badge variant="outline" className="text-[9px] ml-1 py-0 h-4">Tú</Badge>
                            </p>
                            <p className="text-xs text-muted-foreground">Total: {currentPlayer.total_score || '-'}</p>
                          </div>
                        </div>
                        
                        {currentPlayer.hole_scores[activeHoleIndex] > 0 && (
                          <Badge className={`${getScoreBgColor(currentPlayer.hole_scores[activeHoleIndex], currentPar)} text-white`}>
                            {getScoreDiff(currentPlayer.hole_scores[activeHoleIndex], currentPar)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center gap-4">
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustScore(0, activeHoleIndex, -1)}
                            disabled={currentPlayer.hole_scores[activeHoleIndex] <= 0}
                            className="h-14 w-14 rounded-full border-2 shadow-md"
                          >
                            <Minus className="h-6 w-6" />
                          </Button>
                        </motion.div>
                        
                        <motion.div 
                          key={currentPlayer.hole_scores[activeHoleIndex]}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className={`text-5xl font-bold min-w-[80px] text-center ${getScoreColor(currentPlayer.hole_scores[activeHoleIndex], currentPar)}`}
                        >
                          {currentPlayer.hole_scores[activeHoleIndex] || '-'}
                        </motion.div>
                        
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustScore(0, activeHoleIndex, 1)}
                            className="h-14 w-14 rounded-full border-2 shadow-md"
                          >
                            <Plus className="h-6 w-6" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* Opponent Score */}
                  {opponentPlayer && (
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={opponentPlayer.avatar_url} />
                            <AvatarFallback className="bg-orange-500/20 text-orange-600 font-bold">
                              {opponentPlayer.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{opponentPlayer.name?.split(' ')[0]}</p>
                            <p className="text-xs text-muted-foreground">Total: {opponentPlayer.total_score || '-'}</p>
                          </div>
                        </div>
                        
                        {opponentPlayer.hole_scores[activeHoleIndex] > 0 && (
                          <Badge className={`${getScoreBgColor(opponentPlayer.hole_scores[activeHoleIndex], currentPar)} text-white`}>
                            {getScoreDiff(opponentPlayer.hole_scores[activeHoleIndex], currentPar)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center gap-4">
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustScore(1, activeHoleIndex, -1)}
                            disabled={opponentPlayer.hole_scores[activeHoleIndex] <= 0}
                            className="h-12 w-12 rounded-full"
                          >
                            <Minus className="h-5 w-5" />
                          </Button>
                        </motion.div>
                        
                        <motion.div 
                          key={opponentPlayer.hole_scores[activeHoleIndex]}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className={`text-4xl font-bold min-w-[60px] text-center ${getScoreColor(opponentPlayer.hole_scores[activeHoleIndex], currentPar)}`}
                        >
                          {opponentPlayer.hole_scores[activeHoleIndex] || '-'}
                        </motion.div>
                        
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustScore(1, activeHoleIndex, 1)}
                            className="h-12 w-12 rounded-full"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="px-4 py-3 border-t border-border/50 bg-background">
              <div className="flex gap-3 mb-3">
                <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button
                    variant="outline"
                    onClick={goToPrevHole}
                    disabled={activeHoleIndex === 0}
                    className="w-full h-11 rounded-xl"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                </motion.div>
                
                <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button
                    onClick={isLastHole ? submitScores : goToNextHole}
                    disabled={loading}
                    className={`w-full h-11 rounded-xl ${
                      isLastHole 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                        : 'bg-gradient-to-r from-primary to-primary/80'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Guardando
                      </div>
                    ) : isLastHole ? (
                      <>
                        Guardar
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Siguiente
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* All Holes View */}
            <div className="overflow-y-auto flex-1 max-h-[50vh] p-3 space-y-4">
              {players.map((player, playerIndex) => (
                <div key={player.user_id}>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={player.avatar_url} />
                      <AvatarFallback className={`text-xs ${player.isCurrentUser ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-600'}`}>
                        {player.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">{player.name?.split(' ')[0]}</span>
                    {player.isCurrentUser && <Badge variant="outline" className="text-[9px] py-0 h-4">Tú</Badge>}
                    <Badge variant="secondary" className="text-xs ml-auto">
                      Total: {player.total_score || '-'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-1.5">
                    {coursePars.map((par, holeIndex) => (
                      <motion.button 
                        key={holeIndex} 
                        onClick={() => {
                          setActiveHoleIndex(holeIndex);
                          setViewMode('single');
                        }}
                        className={`text-center bg-muted/40 rounded-lg p-1.5 transition-all hover:ring-2 hover:ring-primary/50 ${
                          activeHoleIndex === holeIndex ? 'ring-2 ring-primary' : ''
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-[9px] text-muted-foreground font-medium">H{holeIndex + 1}</div>
                        <div className={`text-sm font-bold ${getScoreColor(player.hole_scores[holeIndex], par)}`}>
                          {player.hole_scores[holeIndex] || '-'}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Save */}
            <div className="p-3 border-t border-border/50 bg-background">
              <div className="flex justify-between items-center bg-muted/30 rounded-lg p-2 mb-3">
                <div className="flex items-center gap-4">
                  {players.map((player) => (
                    <div key={player.user_id} className="flex items-center gap-1.5">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={player.avatar_url} />
                        <AvatarFallback className="text-[9px]">{player.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <Badge variant={player.isCurrentUser ? "default" : "secondary"} className="text-xs h-5">
                        {player.total_score || 0}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">Par {totalPar}</div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-10 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={submitScores} 
                  disabled={loading}
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
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
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};
