import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tournament } from "@/hooks/useTournamentsAndMatches";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Trophy, Users, MapPin, Minus, Plus } from "lucide-react";

interface TournamentScoringCardProps {
  tournament: Tournament;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ParticipantScore {
  user_id: string;
  name: string;
  username: string;
  avatar_url?: string;
  hole_scores: number[];
  total_score: number;
}

export const TournamentScoringCard = ({ tournament, open, onOpenChange, onSuccess }: TournamentScoringCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<ParticipantScore[]>([]);
  const [coursePars, setCoursePars] = useState<number[]>([]);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);

  useEffect(() => {
    if (open && tournament?.id) {
      fetchParticipants();
      fetchCoursePars();
    }
  }, [open, tournament?.id]);

  const fetchParticipants = async () => {
    try {
      const { data: participantsData, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('user_id')
        .eq('tournament_id', tournament.id)
        .eq('status', 'registered');

      if (participantsError) throw participantsError;

      if (!participantsData || participantsData.length === 0) {
        setParticipants([]);
        return;
      }

      const userIds = participantsData.map(p => p.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const participantScores: ParticipantScore[] = participantsData.map(p => {
        const profile = profilesData?.find(profile => profile.id === p.user_id);
        return {
          user_id: p.user_id,
          name: profile?.full_name || profile?.username || 'Jugador',
          username: profile?.username || 'jugador',
          avatar_url: profile?.avatar_url,
          hole_scores: new Array(18).fill(0),
          total_score: 0,
        };
      });

      setParticipants(participantScores);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los participantes.",
        variant: "destructive"
      });
    }
  };

  const fetchCoursePars = async () => {
    try {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('hole_pars')
        .eq('id', tournament?.course_id)
        .maybeSingle();

      if (error) throw error;
      setCoursePars(data?.hole_pars || new Array(18).fill(4));
    } catch (error) {
      console.error('Error fetching course pars:', error);
      setCoursePars(new Array(18).fill(4));
    }
  };

  const currentParticipant = participants[currentParticipantIndex];
  const currentPar = coursePars[currentHoleIndex] || 4;
  const currentScore = currentParticipant?.hole_scores[currentHoleIndex] || 0;
  const completedHoles = currentParticipant?.hole_scores.filter(score => score > 0).length || 0;

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
    if (!currentParticipant) return;
    const newParticipants = [...participants];
    const newScore = (newParticipants[currentParticipantIndex].hole_scores[currentHoleIndex] || 0) + 1;
    newParticipants[currentParticipantIndex].hole_scores[currentHoleIndex] = Math.min(newScore, 15);
    newParticipants[currentParticipantIndex].total_score = newParticipants[currentParticipantIndex].hole_scores.reduce((sum, s) => sum + s, 0);
    setParticipants(newParticipants);
  };

  const decrementScore = () => {
    if (!currentParticipant) return;
    const newParticipants = [...participants];
    const currentScore = newParticipants[currentParticipantIndex].hole_scores[currentHoleIndex] || 0;
    if (currentScore > 0) {
      newParticipants[currentParticipantIndex].hole_scores[currentHoleIndex] = currentScore - 1;
      newParticipants[currentParticipantIndex].total_score = newParticipants[currentParticipantIndex].hole_scores.reduce((sum, s) => sum + s, 0);
      setParticipants(newParticipants);
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
      if (currentParticipantIndex < participants.length - 1) {
        setCurrentParticipantIndex(currentParticipantIndex + 1);
        setCurrentHoleIndex(0);
        toast({
          title: "Siguiente jugador",
          description: `Ingresando puntajes para ${participants[currentParticipantIndex + 1]?.name}`,
        });
      } else {
        toast({
          title: "Ronda Completa",
          description: "Todos los participantes han completado sus rondas.",
        });
      }
    }
  };

  const goToPreviousHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1);
    } else if (currentParticipantIndex > 0) {
      setCurrentParticipantIndex(currentParticipantIndex - 1);
      setCurrentHoleIndex(17);
    }
  };

  const submitScores = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const scores = participants.map(p => ({
        tournament_id: tournament.id,
        participant_id: p.user_id,
        round_number: currentRound,
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
        title: "Puntajes Enviados",
        description: `Los puntajes de la ronda ${currentRound} han sido guardados.`,
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

  const isAllParticipantsComplete = participants.every(participant => 
    participant.hole_scores.every(score => score > 0)
  );

  const totalPar = coursePars.slice(0, completedHoles).reduce((sum, par) => sum + par, 0);
  const vsParScore = (currentParticipant?.total_score || 0) - totalPar;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto p-0 bg-zinc-950 border-white/10">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <span className="text-lg font-semibold text-foreground">{tournament?.name || "Cargar Puntajes"}</span>
                <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {tournament?.golf_courses?.name || 'Campo de Golf'}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-4 pb-4 space-y-4">
          {/* Round Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Ronda</label>
            <Select value={currentRound.toString()} onValueChange={(value) => setCurrentRound(parseInt(value))}>
              <SelectTrigger className="bg-zinc-900 border-white/10 h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="1">Ronda 1</SelectItem>
                <SelectItem value="2">Ronda 2</SelectItem>
                <SelectItem value="3">Ronda 3</SelectItem>
                <SelectItem value="4">Ronda 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Participant Card */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-amber-500/30">
                  <AvatarImage src={currentParticipant?.avatar_url} />
                  <AvatarFallback className="bg-amber-500/20 text-amber-400 font-bold">
                    {currentParticipant?.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">{currentParticipant?.name}</div>
                  <div className="text-sm text-zinc-500">@{currentParticipant?.username}</div>
                </div>
              </div>
              <Badge className="bg-zinc-800 text-zinc-400 border-0">
                <Users className="h-3 w-3 mr-1" />
                {currentParticipantIndex + 1}/{participants.length}
              </Badge>
            </div>

            {/* Participants Mini-View */}
            {participants.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {participants.map((participant, index) => (
                  <button
                    key={participant.user_id}
                    onClick={() => {
                      setCurrentParticipantIndex(index);
                      setCurrentHoleIndex(0);
                    }}
                    className={`flex-shrink-0 p-2 rounded-xl transition-all ${
                      index === currentParticipantIndex 
                        ? 'bg-amber-500/20 ring-2 ring-amber-500/50' 
                        : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar_url} />
                      <AvatarFallback className="text-xs">{participant.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            )}
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
              <div className="text-2xl font-bold text-foreground">{currentParticipant?.total_score || 0}</div>
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
              disabled={currentHoleIndex === 0 && currentParticipantIndex === 0}
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
              ) : currentParticipantIndex < participants.length - 1 ? (
                <>
                  Siguiente Jugador
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Completar
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Submit Button */}
          {isAllParticipantsComplete && (
            <div className="pt-4 border-t border-white/5 space-y-4">
              {/* Leaderboard Preview */}
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 rounded-2xl border border-amber-500/20">
                <h3 className="font-semibold text-center mb-3 text-foreground flex items-center justify-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  Clasificación Ronda {currentRound}
                </h3>
                <div className="space-y-2">
                  {[...participants]
                    .sort((a, b) => (a.total_score || 999) - (b.total_score || 999))
                    .map((participant, index) => (
                      <div key={participant.user_id} className={`flex items-center justify-between p-3 rounded-xl ${
                        index === 0 ? 'bg-amber-500/10 border border-amber-500/30' : 
                        index === 1 ? 'bg-zinc-700/50' :
                        index === 2 ? 'bg-orange-900/20' :
                        'bg-zinc-800/50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-amber-500 text-zinc-900' :
                            index === 1 ? 'bg-zinc-400 text-zinc-900' :
                            index === 2 ? 'bg-orange-700 text-white' :
                            'bg-zinc-700 text-zinc-400'
                          }`}>
                            {index + 1}
                          </span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.avatar_url} />
                            <AvatarFallback className="text-xs bg-zinc-800">{participant.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className={`font-medium ${index === 0 ? 'text-amber-400' : 'text-foreground'}`}>
                            {participant.name}
                          </span>
                        </div>
                        <Badge className={`${index === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'} border-0`}>
                          {participant.total_score}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>

              <Button 
                onClick={submitScores} 
                disabled={loading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-900 font-semibold text-lg shadow-lg shadow-amber-500/20"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Trophy className="h-5 w-5 mr-2" />
                    Enviar Ronda {currentRound}
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
