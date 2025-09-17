import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, MapPin, Calendar, Users, Crown, Target, Clock, Edit, Trash2, Star } from "lucide-react";
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
        gradient: 'from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20',
        badgeClass: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
        iconColor: 'text-blue-500',
        label: 'Upcoming'
      };
    }
    if (isActive) {
      return {
        gradient: 'from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
        iconColor: 'text-amber-500',
        label: 'Active'
      };
    }
    return {
      gradient: 'from-muted/30 to-muted/50',
      badgeClass: 'bg-muted text-muted-foreground border-muted-foreground/20',
      iconColor: 'text-muted-foreground',
      label: 'Completed'
    };
  };

  const statusConfig = getStatusConfig();
  const participants = tournament.tournament_participants || [];
  const participantCount = participants.length;
  const maxParticipants = tournament.max_players || 8;

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer bg-gradient-to-r ${statusConfig.gradient} border-l-4 ${statusConfig.iconColor.replace('text-', 'border-')}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header with name, status and creator badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Trophy className={`h-5 w-5 ${statusConfig.iconColor} flex-shrink-0`} />
            <div>
              <h3 className="font-semibold text-lg truncate">{tournament.name}</h3>
              {isCreator && (
                <Badge variant="outline" className="text-xs mt-1">
                  <Crown className="h-3 w-3 mr-1" />
                  Host
                </Badge>
              )}
            </div>
          </div>
          <Badge className={`${statusConfig.badgeClass} text-xs px-2 py-1`}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Tournament Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{tournament.golf_courses?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              {tournament.start_date === tournament.end_date 
                ? format(new Date(tournament.start_date), 'EEEE, MMM d, yyyy')
                : `${format(new Date(tournament.start_date), 'MMM d')} - ${format(new Date(tournament.end_date || tournament.start_date), 'MMM d, yyyy')}`
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{participantCount}/{maxParticipants} players</span>
            {tournament.entry_fee && tournament.entry_fee > 0 && (
              <>
                <span>•</span>
                <span>${tournament.entry_fee} entry</span>
              </>
            )}
          </div>
        </div>

        {/* Prize Pool (if applicable) */}
        {tournament.prize_pool && tournament.prize_pool > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Prize Pool: ${tournament.prize_pool}
              </span>
            </div>
          </div>
        )}

        {/* Participants Avatars */}
        <div className="bg-background/60 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Participants</span>
            <span className="text-xs text-muted-foreground">{participantCount}/{maxParticipants}</span>
          </div>
          <div className="flex -space-x-2">
            {participants.slice(0, 6).map((participant, index) => (
              <Avatar key={participant.id || index} className="h-8 w-8 ring-2 ring-background">
                <AvatarImage src={participant.profiles?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {participant.profiles?.full_name?.[0] || 
                   participant.profiles?.username?.[0] || 
                   'P'}
                </AvatarFallback>
              </Avatar>
            ))}
            {participantCount > 6 && (
              <div className="h-8 w-8 bg-muted rounded-full ring-2 ring-background flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  +{participantCount - 6}
                </span>
              </div>
            )}
            {participantCount === 0 && (
              <div className="text-xs text-muted-foreground py-2">
                No participants yet
              </div>
            )}
          </div>
        </div>

        {/* Tournament Description (if available) */}
        {tournament.description && (
          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p className="line-clamp-2">{tournament.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isActive && isCreator && (
            <Button
              onClick={() => onLoadScores?.(tournament)}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
              size="lg"
            >
              <Target className="h-5 w-5 mr-2" />
              Load Tournament Scores
            </Button>
          )}

          {isUpcoming && isCreator && (
            <div className="flex gap-2 flex-1">
              <Button
                onClick={() => onEdit?.(tournament)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => onDelete?.(tournament.id)}
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center justify-center w-full py-2 text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">Tournament completed</span>
            </div>
          )}

          {isUpcoming && !isCreator && (
            <div className="flex items-center justify-center w-full py-2 text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">Starts {format(new Date(tournament.start_date), 'MMM d')}</span>
            </div>
          )}
        </div>

        {/* Progress bar for participant slots */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              participantCount === maxParticipants 
                ? 'bg-green-500' 
                : participantCount > maxParticipants * 0.7 
                  ? 'bg-amber-500' 
                  : 'bg-primary'
            }`}
            style={{ width: `${(participantCount / maxParticipants) * 100}%` }}
          />
        </div>

        {/* Hover effect overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 pointer-events-none" />
        )}
      </CardContent>
    </Card>
  );
};