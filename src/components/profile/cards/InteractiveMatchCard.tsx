import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Swords, MapPin, Calendar, Trophy, Target, Clock, Edit, Trash2, Check, X } from "lucide-react";
import { Match } from "@/hooks/useTournamentsAndMatches";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

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
  
  // Debug: Log match data to see what's available
  console.log('Match data:', match);
  console.log('Golf course data:', match.golf_courses);
  
  const isCreator = match.creator_id === user?.id;
  const isOpponent = match.opponent_id === user?.id;
  const isPending = match.status === 'pending';
  const isActive = match.status === 'accepted';
  const isCompleted = match.status === 'completed';

  const getStatusConfig = () => {
    if (isPending) {
      return {
        gradient: 'from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20',
        badgeClass: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
        iconColor: 'text-blue-500',
        label: 'Pending'
      };
    }
    if (isActive) {
      return {
        gradient: 'from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20',
        badgeClass: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
        iconColor: 'text-green-500',
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

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer bg-gradient-to-r ${statusConfig.gradient} border-l-4 ${statusConfig.iconColor.replace('text-', 'border-')}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header with name and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className={`h-5 w-5 ${statusConfig.iconColor}`} />
            <h3 className="font-semibold text-lg truncate">{match.name}</h3>
          </div>
          <Badge className={`${statusConfig.badgeClass} text-xs px-2 py-1`}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Players Section */}
        <div className="flex items-center justify-between px-4 py-4 bg-background/80 rounded-xl border border-border/50">
          {/* Creator */}
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-16 w-16 ring-2 ring-primary/30 shadow-lg">
              <AvatarImage src={match.creator?.avatar_url} alt={`${match.creator?.full_name || match.creator?.username || 'Creator'} profile`} />
              <AvatarFallback className="bg-primary/15 text-primary font-bold text-lg">
                {match.creator?.full_name?.[0] || match.creator?.username?.[0] || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="font-semibold text-sm truncate max-w-24 text-foreground">
                {match.creator?.full_name || match.creator?.username || 'Creator'}
              </div>
              {isCreator && (
                <Badge variant="default" className="text-xs mt-1 bg-primary/10 text-primary border-primary/20">You</Badge>
              )}
            </div>
          </div>

          {/* VS indicator */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-primary/20 to-primary/30 p-3 rounded-full shadow-md">
              <Swords className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground mt-2">VS</span>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-16 w-16 ring-2 ring-secondary/30 shadow-lg">
              <AvatarImage src={match.opponent?.avatar_url} alt={`${match.opponent?.full_name || match.opponent?.username || 'Opponent'} profile`} />
              <AvatarFallback className="bg-secondary/15 text-secondary-foreground font-bold text-lg">
                {match.opponent?.full_name?.[0] || match.opponent?.username?.[0] || 'O'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="font-semibold text-sm truncate max-w-24 text-foreground">
                {match.opponent?.full_name || match.opponent?.username || 'Opponent'}
              </div>
              {isOpponent && (
                <Badge variant="default" className="text-xs mt-1 bg-secondary/10 text-secondary-foreground border-secondary/20">You</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Match Details */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
            <MapPin className="h-5 w-5 flex-shrink-0 text-primary" />
            <span className="font-medium text-foreground truncate">
              {match.golf_courses?.name || 'Loading course...'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{format(new Date(match.match_date), 'EEEE, MMM d, yyyy')}</span>
          </div>
          {match.stakes && (
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Stakes: {match.stakes}</span>
            </div>
          )}
        </div>

        {/* Winner Display */}
        {isCompleted && match.winner_id && (
          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">
                Winner: {match.winner_id === match.creator_id 
                  ? (match.creator?.full_name || 'Creator')
                  : (match.opponent?.full_name || 'Opponent')
                }
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isPending && isOpponent && (
            <>
              <Button
                onClick={() => onAccept?.(match.id)}
                disabled={isAccepting}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <Check className="h-4 w-4 mr-2" />
                {isAccepting ? "Accepting..." : "Accept"}
              </Button>
              <Button
                onClick={() => onDecline?.(match.id)}
                disabled={isDeclining}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                {isDeclining ? "Declining..." : "Decline"}
              </Button>
            </>
          )}

          {isActive && (isCreator || isOpponent) && (
            <Button
              onClick={() => onLoadScores?.(match)}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
              size="lg"
            >
              <Target className="h-5 w-5 mr-2" />
              Load Scores
            </Button>
          )}

          {isPending && isCreator && (
            <div className="flex gap-2 flex-1">
              <Button
                onClick={() => onEdit?.(match)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => onDelete?.(match.id)}
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
              <span className="text-sm">Match completed</span>
            </div>
          )}
        </div>

        {/* Hover effect overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 pointer-events-none" />
        )}
      </CardContent>
    </Card>
  );
};