import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Swords, Trophy, Zap } from "lucide-react";
import { Match } from "@/hooks/useTournamentsAndMatches";
import { useAuth } from "@/contexts/AuthContext";
import { EventCard, EventStatus } from "./EventCard";

interface InteractiveMatchCardProps {
  match: Match;
  onLoadScores?: (match: Match) => void;
  onEdit?: (match: Match) => void;
  onDelete?: (matchId: string) => void;
}

export const InteractiveMatchCard = ({
  match,
  onLoadScores,
  onEdit,
  onDelete
}: InteractiveMatchCardProps) => {
  const { user } = useAuth();
  
  const isCreator = match.creator_id === user?.id;
  const isOpponent = match.opponent_id === user?.id;
  
  const getStatus = (): EventStatus => {
    if (match.status === 'completed') return 'completed';
    return 'active';
  };

  return (
    <EventCard
      title={match.name}
      location={match.golf_courses?.name || 'Campo de Golf'}
      date={match.match_date}
      status={getStatus()}
      icon={<Swords className="h-5 w-5 text-red-400" />}
      isCreator={isCreator || isOpponent}
      onLoadScores={() => onLoadScores?.(match)}
      onEdit={() => onEdit?.(match)}
      onDelete={() => onDelete?.(match.id)}
      accentColor="red"
    >
      {/* Players VS Section */}
      <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
        <div className="flex items-center justify-between">
          {/* Creator */}
          <div className="flex flex-col items-center space-y-1.5 flex-1">
            <Avatar className="h-12 w-12 ring-2 ring-emerald-500/30">
              <AvatarImage src={match.creator?.avatar_url} alt={match.creator?.full_name || 'Creator'} />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-semibold text-sm">
                {match.creator?.full_name?.[0] || match.creator?.username?.[0] || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="font-medium text-xs text-foreground truncate max-w-[70px]">
                {match.creator?.full_name || match.creator?.username || 'Creador'}
              </div>
              {isCreator && (
                <Badge variant="outline" className="text-[9px] mt-0.5 h-4 px-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Tú
                </Badge>
              )}
            </div>
          </div>

          {/* VS indicator */}
          <div className="flex flex-col items-center px-3">
            <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-2 rounded-full border border-red-500/30">
              <Zap className="h-4 w-4 text-red-400" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground mt-1 tracking-wider">VS</span>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center space-y-1.5 flex-1">
            <Avatar className="h-12 w-12 ring-2 ring-red-500/30">
              <AvatarImage src={match.opponent?.avatar_url} alt={match.opponent?.full_name || 'Opponent'} />
              <AvatarFallback className="bg-red-500/20 text-red-400 font-semibold text-sm">
                {match.opponent?.full_name?.[0] || match.opponent?.username?.[0] || 'O'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="font-medium text-xs text-foreground truncate max-w-[70px]">
                {match.opponent?.full_name || match.opponent?.username || 'Oponente'}
              </div>
              {isOpponent && (
                <Badge variant="outline" className="text-[9px] mt-0.5 h-4 px-1.5 bg-red-500/10 text-red-400 border-red-500/30">
                  Tú
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stakes & Winner */}
      <div className="flex gap-2">
        {match.stakes && (
          <div className="flex-1 flex items-center gap-2 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400 truncate">
              {match.stakes}
            </span>
          </div>
        )}
        
        {match.status === 'completed' && match.winner_id && (
          <div className="flex-1 flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2 border border-primary/20">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary truncate">
              Ganador: {match.winner_id === match.creator_id 
                ? (match.creator?.full_name || 'Creador')
                : (match.opponent?.full_name || 'Oponente')
              }
            </span>
          </div>
        )}
      </div>
    </EventCard>
  );
};
