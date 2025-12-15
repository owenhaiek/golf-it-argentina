import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, MapPin, Calendar, Users, Crown, Target, Clock, Edit, Trash2, DollarSign, Flame } from "lucide-react";
import { Tournament } from "@/hooks/useTournamentsAndMatches";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface InteractiveTournamentCardProps {
  tournament: Tournament;
  onLoadScores?: (tournament: Tournament) => void;
  onEdit?: (tournament: Tournament) => void;
  onDelete?: (tournamentId: string) => void;
}

export const InteractiveTournamentCard = ({
  tournament,
  onLoadScores,
  onEdit,
  onDelete
}: InteractiveTournamentCardProps) => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  
  const isCreator = tournament.creator_id === user?.id;
  const isUpcoming = tournament.status === 'upcoming';
  const isActive = tournament.status === 'active';
  const isCompleted = tournament.status === 'completed';

  const getStatusConfig = () => {
    if (isUpcoming) {
      return {
        bgClass: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
        badgeClass: 'bg-blue-500/20 text-blue-400 border-0',
        iconColor: 'text-blue-400',
        accentColor: 'bg-blue-500',
        label: 'Próximo'
      };
    }
    if (isActive) {
      return {
        bgClass: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5',
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-0',
        iconColor: 'text-emerald-400',
        accentColor: 'bg-emerald-500',
        label: 'En Juego'
      };
    }
    return {
      bgClass: 'bg-gradient-to-br from-zinc-500/10 to-zinc-600/5',
      badgeClass: 'bg-zinc-500/20 text-zinc-400 border-0',
      iconColor: 'text-zinc-400',
      accentColor: 'bg-zinc-500',
      label: 'Finalizado'
    };
  };

  const statusConfig = getStatusConfig();
  const participants = tournament.tournament_participants || [];
  const participantCount = participants.length;
  const maxParticipants = tournament.max_players || 8;
  const fillPercentage = (participantCount / maxParticipants) * 100;

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl ${statusConfig.bgClass} border border-white/5 transition-all duration-300 ${isHovered ? 'scale-[1.02] shadow-xl shadow-black/20' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${statusConfig.accentColor}`} />
      
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={`p-2.5 rounded-xl ${statusConfig.bgClass} border border-white/10`}>
              <Trophy className={`h-5 w-5 ${statusConfig.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">{tournament.name}</h3>
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
                {tournament.golf_courses?.name}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${statusConfig.badgeClass} font-medium`}>
              {isActive && <Flame className="h-3 w-3 mr-1" />}
              {statusConfig.label}
            </Badge>
            {isCreator && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Host
              </Badge>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>Fecha</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {format(new Date(tournament.start_date), 'dd MMM yyyy')}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Users className="h-3.5 w-3.5" />
              <span>Jugadores</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {participantCount} / {maxParticipants}
            </p>
          </div>
        </div>

        {/* Prize and Entry Fee */}
        {(tournament.prize_pool || tournament.entry_fee) && (
          <div className="flex gap-3">
            {tournament.entry_fee && tournament.entry_fee > 0 && (
              <div className="flex-1 bg-white/5 rounded-xl p-3 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Inscripción</p>
                  <p className="font-semibold text-foreground">${tournament.entry_fee}</p>
                </div>
              </div>
            )}
            {tournament.prize_pool && tournament.prize_pool > 0 && (
              <div className="flex-1 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-3 flex items-center gap-2 border border-amber-500/20">
                <div className="p-1.5 rounded-lg bg-amber-500/20">
                  <Trophy className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-amber-400/70">Premio</p>
                  <p className="font-semibold text-amber-400">${tournament.prize_pool}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Participants */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Participantes</span>
            <span className="text-xs font-medium text-foreground">{participantCount}/{maxParticipants}</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                fillPercentage === 100 
                  ? 'bg-emerald-500' 
                  : fillPercentage > 70 
                    ? 'bg-amber-500' 
                    : 'bg-primary'
              }`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>

          {/* Avatars */}
          {participantCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {participants.slice(0, 5).map((participant, index) => (
                  <Avatar key={participant.id || index} className="h-7 w-7 ring-2 ring-background">
                    <AvatarImage src={participant.profiles?.avatar_url} />
                    <AvatarFallback className="text-xs bg-muted">
                      {participant.profiles?.full_name?.[0] || 
                       participant.profiles?.username?.[0] || 
                       'P'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {participantCount > 5 && (
                  <div className="h-7 w-7 bg-muted rounded-full ring-2 ring-background flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      +{participantCount - 5}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2">
          {isActive && isCreator && (
            <Button
              onClick={() => onLoadScores?.(tournament)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11 rounded-xl"
            >
              <Target className="h-4 w-4 mr-2" />
              Cargar Puntajes
            </Button>
          )}

          {isUpcoming && isCreator && (
            <div className="flex gap-2">
              <Button
                onClick={() => onEdit?.(tournament)}
                variant="outline"
                size="sm"
                className="flex-1 h-10 rounded-xl bg-white/5 border-white/10 hover:bg-white/10"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                onClick={() => onDelete?.(tournament.id)}
                variant="outline"
                size="sm"
                className="flex-1 h-10 rounded-xl bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground bg-white/5 rounded-xl">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Torneo finalizado</span>
            </div>
          )}

          {isUpcoming && !isCreator && (
            <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground bg-white/5 rounded-xl">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Inicia el {format(new Date(tournament.start_date), 'dd MMM')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
