import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Swords, MapPin, Calendar, Trophy, Target, Clock, Edit, Trash2, Check, X, Flame, Zap } from "lucide-react";
import { Match } from "@/hooks/useTournamentsAndMatches";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface InteractiveMatchCardProps {
  match: Match;
  onLoadScores?: (match: Match) => void;
  onEdit?: (match: Match) => void;
  onDelete?: (matchId: string) => void;
  onAccept?: (matchId: string) => void;
  onDecline?: (matchId: string) => void;
  isAccepting?: boolean;
  isDeclining?: boolean;
}

export const InteractiveMatchCard = ({
  match,
  onLoadScores,
  onEdit,
  onDelete,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining
}: InteractiveMatchCardProps) => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  
  const isCreator = match.creator_id === user?.id;
  const isOpponent = match.opponent_id === user?.id;
  const isPending = match.status === 'pending';
  const isActive = match.status === 'accepted';
  const isCompleted = match.status === 'completed';

  const getStatusConfig = () => {
    if (isPending) {
      return {
        bgClass: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
        badgeClass: 'bg-blue-500/20 text-blue-400 border-0',
        iconColor: 'text-blue-400',
        accentColor: 'bg-blue-500',
        label: 'Pendiente'
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

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 transition-all duration-300 ${
        isHovered ? 'scale-[1.01] shadow-xl shadow-black/20' : ''
      }`}
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
              <Swords className={`h-5 w-5 ${statusConfig.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">{match.name}</h3>
              <p className="text-sm text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
                {match.golf_courses?.name || 'Campo de Golf'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${statusConfig.badgeClass} font-medium`}>
              {isActive && <Flame className="h-3 w-3 mr-1" />}
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Players VS Section */}
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between">
            {/* Creator */}
            <div className="flex flex-col items-center space-y-2 flex-1">
              <Avatar className="h-14 w-14 ring-2 ring-emerald-500/30 shadow-lg">
                <AvatarImage src={match.creator?.avatar_url} alt={match.creator?.full_name || 'Creator'} />
                <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-bold">
                  {match.creator?.full_name?.[0] || match.creator?.username?.[0] || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="font-medium text-sm text-foreground truncate max-w-20">
                  {match.creator?.full_name || match.creator?.username || 'Creador'}
                </div>
                {isCreator && (
                  <Badge variant="outline" className="text-[10px] mt-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Tú
                  </Badge>
                )}
              </div>
            </div>

            {/* VS indicator */}
            <div className="flex flex-col items-center px-4">
              <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-3 rounded-full border border-red-500/30">
                <Zap className="h-5 w-5 text-red-400" />
              </div>
              <span className="text-xs font-bold text-zinc-500 mt-1.5 tracking-wider">VS</span>
            </div>

            {/* Opponent */}
            <div className="flex flex-col items-center space-y-2 flex-1">
              <Avatar className="h-14 w-14 ring-2 ring-red-500/30 shadow-lg">
                <AvatarImage src={match.opponent?.avatar_url} alt={match.opponent?.full_name || 'Opponent'} />
                <AvatarFallback className="bg-red-500/20 text-red-400 font-bold">
                  {match.opponent?.full_name?.[0] || match.opponent?.username?.[0] || 'O'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="font-medium text-sm text-foreground truncate max-w-20">
                  {match.opponent?.full_name || match.opponent?.username || 'Oponente'}
                </div>
                {isOpponent && (
                  <Badge variant="outline" className="text-[10px] mt-1 bg-red-500/10 text-red-400 border-red-500/20">
                    Tú
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Match Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800/50 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>Fecha</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {format(new Date(match.match_date), 'dd MMM yyyy', { locale: es })}
            </p>
          </div>
          {match.stakes && (
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-3 space-y-1 border border-amber-500/20">
              <div className="flex items-center gap-1.5 text-amber-400/70 text-xs">
                <Trophy className="h-3.5 w-3.5" />
                <span>Apuesta</span>
              </div>
              <p className="text-sm font-medium text-amber-400 truncate">
                {match.stakes}
              </p>
            </div>
          )}
        </div>

        {/* Winner Display */}
        {isCompleted && match.winner_id && (
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 p-3 rounded-xl border border-amber-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Trophy className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-sm font-medium text-amber-400">
                Ganador: {match.winner_id === match.creator_id 
                  ? (match.creator?.full_name || 'Creador')
                  : (match.opponent?.full_name || 'Oponente')
                }
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2">
          {isPending && isOpponent && (
            <div className="flex gap-2">
              <Button
                onClick={() => onAccept?.(match.id)}
                disabled={isAccepting}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-11 rounded-xl font-medium"
              >
                <Check className="h-4 w-4 mr-2" />
                {isAccepting ? "Aceptando..." : "Aceptar"}
              </Button>
              <Button
                onClick={() => onDecline?.(match.id)}
                disabled={isDeclining}
                variant="outline"
                className="flex-1 h-11 rounded-xl bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
              >
                <X className="h-4 w-4 mr-2" />
                {isDeclining ? "Rechazando..." : "Rechazar"}
              </Button>
            </div>
          )}

          {isActive && (isCreator || isOpponent) && (
            <Button
              onClick={() => onLoadScores?.(match)}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium h-12 rounded-xl shadow-lg shadow-emerald-500/20"
            >
              <Target className="h-5 w-5 mr-2" />
              Cargar Puntajes
            </Button>
          )}

          {isPending && isCreator && (
            <div className="flex gap-2">
              <Button
                onClick={() => onEdit?.(match)}
                variant="outline"
                className="flex-1 h-10 rounded-xl bg-zinc-800 border-white/10 hover:bg-zinc-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                onClick={() => onDelete?.(match.id)}
                variant="outline"
                className="flex-1 h-10 rounded-xl bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center justify-center gap-2 py-2 text-zinc-500 bg-zinc-800/50 rounded-xl">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Partido finalizado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
