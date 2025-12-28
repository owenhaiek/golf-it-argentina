import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Swords, Trophy, Zap, Users } from "lucide-react";
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
  const isParticipant = match.participants?.some(p => p.user_id === user?.id) || isCreator || isOpponent;
  
  // Build complete participants list including creator and opponent
  // First, get accepted participants from match_participants table
  const acceptedFromParticipants = match.participants?.filter(p => p.status === 'accepted') || [];
  
  // Define participant type for display
  type DisplayParticipant = {
    id: string;
    user_id: string;
    status: string;
    profile?: {
      full_name?: string;
      username?: string;
      avatar_url?: string;
    };
  };
  
  // Create base participants from creator and opponent
  const baseParticipants: DisplayParticipant[] = [
    { id: 'creator', user_id: match.creator_id, status: 'accepted', profile: match.creator },
    { id: 'opponent', user_id: match.opponent_id, status: 'accepted', profile: match.opponent }
  ];
  
  // Combine: use accepted participants if they exist, otherwise use base participants
  // Also add any additional accepted participants that aren't already in the list
  const allParticipants = (() => {
    const seenUserIds = new Set<string>();
    const result: DisplayParticipant[] = [];
    
    // Always include creator first
    seenUserIds.add(match.creator_id);
    result.push(baseParticipants[0]);
    
    // Add accepted participants from match_participants (excluding creator)
    acceptedFromParticipants.forEach(p => {
      if (!seenUserIds.has(p.user_id)) {
        seenUserIds.add(p.user_id);
        result.push(p);
      }
    });
    
    // Add opponent if not already in list
    if (!seenUserIds.has(match.opponent_id)) {
      result.push(baseParticipants[1]);
    }
    
    return result;
  })();
  
  const getStatus = (): EventStatus => {
    if (match.status === 'completed') return 'completed';
    return 'active';
  };

  const getWinnerName = () => {
    if (!match.winner_id) return null;
    const winner = allParticipants.find(p => p.user_id === match.winner_id);
    return winner?.profile?.full_name || winner?.profile?.username || 'Ganador';
  };

  return (
    <EventCard
      title={match.name}
      location={match.golf_courses?.name || 'Campo de Golf'}
      date={match.match_date}
      status={getStatus()}
      icon={<Swords className="h-5 w-5 text-red-400" />}
      isCreator={isCreator}
      canLoadScores={isParticipant}
      onLoadScores={() => onLoadScores?.(match)}
      onEdit={() => onEdit?.(match)}
      onDelete={() => onDelete?.(match.id)}
      accentColor="red"
    >
      {/* Players Section */}
      <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
        {allParticipants.length <= 2 ? (
          // Original 2-player layout
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
        ) : (
          // Multi-player layout (3-4 players) with VS separators
          <div className="flex items-center justify-center flex-wrap gap-1">
            {allParticipants.map((participant, index) => {
              const isCurrentUser = participant.user_id === user?.id;
              const isLast = index === allParticipants.length - 1;
              const colors = ['emerald', 'red', 'blue', 'amber'];
              const color = colors[index % colors.length];
              
              return (
                <div key={participant.id} className="flex items-center">
                  <div className="flex flex-col items-center space-y-1 px-2">
                    <Avatar className={`h-10 w-10 ring-2 ${isCurrentUser ? 'ring-emerald-500/50' : `ring-${color}-500/30`}`}>
                      <AvatarImage 
                        src={participant.profile?.avatar_url} 
                        alt={participant.profile?.full_name || 'Player'} 
                      />
                      <AvatarFallback className={`font-semibold text-xs ${isCurrentUser ? 'bg-emerald-500/20 text-emerald-400' : `bg-${color}-500/20 text-${color}-400`}`}>
                        {participant.profile?.full_name?.[0] || participant.profile?.username?.[0] || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <div className="font-medium text-[10px] text-foreground truncate max-w-[50px]">
                        {participant.profile?.full_name?.split(' ')[0] || participant.profile?.username || 'Jugador'}
                      </div>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-[8px] h-3.5 px-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          Tú
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* VS separator */}
                  {!isLast && (
                    <div className="flex flex-col items-center px-1">
                      <span className="text-[10px] font-bold text-muted-foreground tracking-wider">vs</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
              Ganador: {getWinnerName()}
            </span>
          </div>
        )}
      </div>
    </EventCard>
  );
};
