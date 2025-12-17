import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/hooks/useTournamentsAndMatches";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Trophy, Swords, Zap, MapPin, Target, Minus, Plus } from "lucide-react";

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
        name: match.creator?.full_name || 'Creador',
        username: match.creator?.username || 'creador',
        avatar_url: match.creator?.avatar_url,
        hole_scores: new Array(18).fill(0),
        total_score: 0,
      },
      {
        user_id: match.opponent_id || "",
        name: match.opponent?.full_name || 'Oponente',
        username: match.opponent?.username || 'oponente',
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
    if (score === 0) return 'text-zinc-500';
    const diff = score - par;
    if (diff < 0) return 'text-emerald-400';
    if (diff === 0) return 'text-blue-400';
    return 'text-red-400';
  };

  const getScoreTerm = (score: number, par: number): string => {
    if (score === 0) return '-';
    const diff = score - par;
    if (diff === -2) return 'Eagle';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double';
    if (diff > 2) return 'Triple+';
    return '';
  };

  const getScoreBackground = (score: number, par: number): string => {
    if (score === 0) return 'bg-zinc-800';
    const diff = score - par;
    if (diff <= -2) return 'bg-amber-500/20 border-amber-500/30';
    if (diff === -1) return 'bg-emerald-500/20 border-emerald-500/30';
    if (diff === 0) return 'bg-blue-500/20 border-blue-500/30';
    if (diff === 1) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
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
        title: "Ingresa un puntaje",
        description: "Por favor ingresa un puntaje antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    if (currentHoleIndex < 17) {
      setCurrentHoleIndex(currentHoleIndex + 1);
    } else {
      toast({
        title: "Ronda Completa",
        description: `${currentPlayer?.name} ha completado su ronda.`,
      });
    }
  };

  const selectPlayer = (playerIndex: number) => {
    setCurrentPlayerIndex(playerIndex);
    setCurrentHoleIndex(0);
    toast({
      title: "Jugador Seleccionado",
      description: `Ingresando puntajes para ${players[playerIndex]?.name}`,
    });
  };

  const getCurrentPlayerProgress = (playerIndex: number) => {
    const player = players[playerIndex];
    if (!player) return 0;
    return player.hole_scores.filter(score => score > 0).length;
  };

  const isPlayerComplete = (playerIndex: number) => {
    const player = players[playerIndex];
    if (!player) return false;
    return player.hole_scores.every(score => score > 0);
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
        title: "Puntajes Enviados",
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

  const isAllPlayersComplete = players.every(player => 
    player.hole_scores.every(score => score > 0)
  );

  const totalPar = coursePars.slice(0, completedHoles).reduce((sum, par) => sum + par, 0);
  const vsParScore = (currentPlayer?.total_score || 0) - totalPar;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto p-0 bg-zinc-950 border-white/10">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <Swords className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <span className="text-lg font-semibold text-foreground">{match?.name || "Cargar Puntajes"}</span>
                <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {match?.golf_courses?.name || 'Campo de Golf'}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-4 pb-4 space-y-4">
          {/* Players VS Section */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between">
              {/* Player 1 - Clickable */}
              <button 
                className={`flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-300 flex-1 ${
                  currentPlayerIndex === 0 
                    ? 'bg-emerald-500/10 ring-2 ring-emerald-500/50 scale-105' 
                    : 'hover:bg-zinc-800'
                }`}
                onClick={() => selectPlayer(0)}
              >
                <Avatar className={`h-14 w-14 ring-2 transition-all duration-300 ${
                  currentPlayerIndex === 0 ? 'ring-emerald-500/70 shadow-lg shadow-emerald-500/20' : 'ring-zinc-700'
                }`}>
                  <AvatarImage src={players[0]?.avatar_url} alt={players[0]?.name} />
                  <AvatarFallback className={`font-bold ${
                    currentPlayerIndex === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {players[0]?.name?.[0] || "P1"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <div className="font-medium text-sm truncate max-w-20 text-foreground">
                    {players[0]?.name || 'Jugador 1'}
                  </div>
                  <Badge className={`text-xs mt-1 border-0 ${
                    currentPlayerIndex === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {players[0]?.total_score || 0}
                  </Badge>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    {getCurrentPlayerProgress(0)}/18
                    {isPlayerComplete(0) && (
                      <span className="text-emerald-400 ml-1">✓</span>
                    )}
                  </div>
                </div>
              </button>

              {/* VS Indicator */}
              <div className="flex flex-col items-center px-2">
                <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-3 rounded-full border border-red-500/30">
                  <Zap className="h-5 w-5 text-red-400" />
                </div>
                <span className="text-xs font-bold text-zinc-600 mt-1.5 tracking-wider">VS</span>
              </div>

              {/* Player 2 - Clickable */}
              <button 
                className={`flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-300 flex-1 ${
                  currentPlayerIndex === 1 
                    ? 'bg-red-500/10 ring-2 ring-red-500/50 scale-105' 
                    : 'hover:bg-zinc-800'
                }`}
                onClick={() => selectPlayer(1)}
              >
                <Avatar className={`h-14 w-14 ring-2 transition-all duration-300 ${
                  currentPlayerIndex === 1 ? 'ring-red-500/70 shadow-lg shadow-red-500/20' : 'ring-zinc-700'
                }`}>
                  <AvatarImage src={players[1]?.avatar_url} alt={players[1]?.name} />
                  <AvatarFallback className={`font-bold ${
                    currentPlayerIndex === 1 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {players[1]?.name?.[0] || "P2"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <div className="font-medium text-sm truncate max-w-20 text-foreground">
                    {players[1]?.name || 'Jugador 2'}
                  </div>
                  <Badge className={`text-xs mt-1 border-0 ${
                    currentPlayerIndex === 1 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {players[1]?.total_score || 0}
                  </Badge>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    {getCurrentPlayerProgress(1)}/18
                    {isPlayerComplete(1) && (
                      <span className="text-emerald-400 ml-1">✓</span>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Current Player Indicator */}
            <div className="mt-4 p-2.5 bg-zinc-800/50 rounded-xl border border-white/5">
              <div className="text-center text-sm">
                <span className="text-zinc-500">Ingresando puntajes para: </span>
                <span className="font-semibold text-foreground">
                  {currentPlayer?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Progreso</span>
              <span className="font-medium text-foreground">{completedHoles}/18 hoyos</span>
            </div>
            <Progress value={(completedHoles / 18) * 100} className="h-2 bg-zinc-800" />
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900 rounded-xl p-3 text-center border border-white/5">
              <div className="text-xs text-zinc-500 mb-1">Total</div>
              <div className="text-2xl font-bold text-foreground">{currentPlayer?.total_score || 0}</div>
            </div>
            <div className="bg-zinc-900 rounded-xl p-3 text-center border border-white/5">
              <div className="text-xs text-zinc-500 mb-1">Par</div>
              <div className="text-2xl font-bold text-foreground">{totalPar}</div>
            </div>
            <div className={`rounded-xl p-3 text-center border ${
              vsParScore < 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 
              vsParScore === 0 ? 'bg-blue-500/10 border-blue-500/20' : 
              'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="text-xs text-zinc-500 mb-1">vs Par</div>
              <div className={`text-2xl font-bold ${
                vsParScore < 0 ? 'text-emerald-400' : 
                vsParScore === 0 ? 'text-blue-400' : 'text-red-400'
              }`}>
                {vsParScore > 0 ? '+' : ''}{vsParScore}
              </div>
            </div>
          </div>

          {/* Hole Display */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
            <div className="text-center mb-4">
              <div className="text-zinc-500 text-sm">Hoyo</div>
              <div className="text-4xl font-bold text-foreground">{currentHoleIndex + 1}</div>
              <Badge className="mt-2 bg-zinc-800 border-0 text-zinc-400">
                Par {currentPar}
              </Badge>
            </div>

            {/* Score Input */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={decrementScore}
                disabled={currentScore === 0}
                className="p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 border border-white/5"
              >
                <Minus className="h-6 w-6 text-foreground" />
              </button>
              
              <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${getScoreBackground(currentScore, currentPar)}`}>
                <span className={`text-4xl font-bold ${getScoreColor(currentScore, currentPar)}`}>
                  {currentScore || '-'}
                </span>
                <span className={`text-xs font-medium ${getScoreColor(currentScore, currentPar)}`}>
                  {getScoreTerm(currentScore, currentPar)}
                </span>
              </div>

              <button
                onClick={incrementScore}
                disabled={currentScore >= 15}
                className="p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 border border-white/5"
              >
                <Plus className="h-6 w-6 text-foreground" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={goToPreviousHole}
              disabled={currentHoleIndex === 0}
              className="flex-1 h-12 rounded-xl bg-zinc-900 border-white/5 hover:bg-zinc-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            
            <Button
              onClick={goToNextHole}
              disabled={!currentScore}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
            >
              {currentHoleIndex < 17 ? (
                <>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Finalizar
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Finalize Match Button */}
          {isAllPlayersComplete && (
            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-4 rounded-2xl border border-emerald-500/20">
                <h3 className="font-semibold text-center mb-3 text-foreground">Resultados del Partido</h3>
                <div className="space-y-2">
                  {players
                    .sort((a, b) => (a.total_score || 999) - (b.total_score || 999))
                    .map((player, index) => (
                      <div key={player.user_id} className={`flex items-center justify-between p-3 rounded-xl ${
                        index === 0 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-zinc-800/50'
                      }`}>
                        <div className="flex items-center gap-3">
                          {index === 0 && (
                            <div className="p-1.5 rounded-lg bg-amber-500/20">
                              <Trophy className="h-4 w-4 text-amber-400" />
                            </div>
                          )}
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={player.avatar_url} />
                            <AvatarFallback className="text-xs bg-zinc-800">{player.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className={`font-medium ${index === 0 ? 'text-amber-400' : 'text-foreground'}`}>
                            {player.name}
                          </span>
                        </div>
                        <Badge className={`${index === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'} border-0`}>
                          {player.total_score}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>

              <Button
                onClick={submitScores}
                disabled={loading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-lg shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Trophy className="h-5 w-5 mr-2" />
                    Finalizar Partido
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
