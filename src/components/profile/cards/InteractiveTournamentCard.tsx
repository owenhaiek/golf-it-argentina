import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Users, Crown, DollarSign } from "lucide-react";
import { Tournament } from "@/hooks/useTournamentsAndMatches";
import { useAuth } from "@/contexts/AuthContext";
import { EventCard, EventStatus } from "./EventCard";

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
  
  const isCreator = tournament.creator_id === user?.id;
  const isParticipant = tournament.tournament_participants?.some(p => p.user_id === user?.id) || isCreator;
  
  const getStatus = (): EventStatus => {
    if (tournament.status === 'completed') return 'completed';
    if (tournament.status === 'active') return 'active';
    return 'upcoming';
  };

  const participants = tournament.tournament_participants || [];
  const participantCount = participants.length;
  const maxParticipants = tournament.max_players || 8;
  const fillPercentage = (participantCount / maxParticipants) * 100;

  return (
    <EventCard
      title={tournament.name}
      location={tournament.golf_courses?.name}
      date={tournament.start_date}
      status={getStatus()}
      icon={<Trophy className="h-5 w-5 text-amber-400" />}
      isCreator={isCreator}
      canLoadScores={isParticipant}
      onLoadScores={() => onLoadScores?.(tournament)}
      onEdit={() => onEdit?.(tournament)}
      onDelete={() => onDelete?.(tournament.id)}
      accentColor="amber"
    >
      {/* Host Badge */}
      {isCreator && (
        <div className="flex">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
            <Crown className="h-3 w-3 mr-1" />
            Organizador
          </Badge>
        </div>
      )}

      {/* Prize and Entry Fee */}
      {(tournament.prize_pool || tournament.entry_fee) && (
        <div className="flex gap-2">
          {tournament.entry_fee && tournament.entry_fee > 0 && (
            <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Inscripción</p>
                <p className="text-xs font-semibold text-foreground">${tournament.entry_fee}</p>
              </div>
            </div>
          )}
          {tournament.prize_pool && tournament.prize_pool > 0 && (
            <div className="flex-1 flex items-center gap-2 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <div className="min-w-0">
                <p className="text-[10px] text-amber-400/70">Premio</p>
                <p className="text-xs font-semibold text-amber-400">${tournament.prize_pool}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Participants */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>Participantes</span>
          </div>
          <span className="text-xs font-medium text-foreground">{participantCount}/{maxParticipants}</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
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
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {participants.slice(0, 4).map((participant, index) => (
                <Avatar key={participant.id || index} className="h-6 w-6 ring-2 ring-background">
                  <AvatarImage src={participant.profiles?.avatar_url} />
                  <AvatarFallback className="text-[10px] bg-muted">
                    {participant.profiles?.full_name?.[0] || 
                     participant.profiles?.username?.[0] || 
                     'P'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {participantCount > 4 && (
                <div className="h-6 w-6 bg-muted rounded-full ring-2 ring-background flex items-center justify-center">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    +{participantCount - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </EventCard>
  );
};
