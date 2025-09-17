import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Swords, Calendar, MapPin, Users, Crown, Clock, CheckCircle, Edit, Trash2, Play, Target, Check, X } from "lucide-react";
import { useTournamentsAndMatches } from "@/hooks/useTournamentsAndMatches";
import { formatDistanceToNow, format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EditTournamentDialog } from "@/components/tournaments/EditTournamentDialog";
import { EditMatchDialog } from "@/components/matches/EditMatchDialog";
import { TournamentScoringDialog } from "@/components/scoring/TournamentScoringDialog";
import { MatchScoringDialog } from "@/components/scoring/MatchScoringDialog";
import { InteractiveMatchCard } from "@/components/profile/cards/InteractiveMatchCard";
import { InteractiveTournamentCard } from "@/components/profile/cards/InteractiveTournamentCard";
import { MatchScoringCard } from "@/components/scoring/MatchScoringCard";
import { TournamentScoringCard } from "@/components/scoring/TournamentScoringCard";

type ViewMode = 'tournaments' | 'matches';

export const TournamentsAndMatchesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    upcomingTournaments,
    activeTournaments,
    completedTournaments,
    pendingMatches,
    activeMatches,
    completedMatches,
    isLoading,
    refetchAll,
    acceptMatch,
    declineMatch,
    isAcceptingMatch,
    isDecliningMatch
  } = useTournamentsAndMatches();

  const [viewMode, setViewMode] = useState<ViewMode>('tournaments');
  const [editTournamentDialog, setEditTournamentDialog] = useState<{ open: boolean; tournament: any }>({ open: false, tournament: null });
  const [editMatchDialog, setEditMatchDialog] = useState<{ open: boolean; match: any }>({ open: false, match: null });
  const [tournamentScoringDialog, setTournamentScoringDialog] = useState<{ open: boolean; tournament: any }>({ open: false, tournament: null });
  const [matchScoringDialog, setMatchScoringDialog] = useState<{ open: boolean; match: any }>({ open: false, match: null });
  const [tournamentScoringCard, setTournamentScoringCard] = useState<{ open: boolean; tournament: any }>({ open: false, tournament: null });
  const [matchScoringCard, setMatchScoringCard] = useState<{ open: boolean; match: any }>({ open: false, match: null });

  const deleteTournament = async (tournamentId: string) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId)
        .eq('creator_id', user?.id);

      if (error) throw error;

      toast({
        title: "Tournament Deleted",
        description: "Tournament has been successfully deleted.",
      });
      refetchAll();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast({
        title: "Error",
        description: "Failed to delete tournament.",
        variant: "destructive",
      });
    }
  };

  const deleteMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)
        .eq('creator_id', user?.id);

      if (error) throw error;

      toast({
        title: "Match Deleted",
        description: "Match has been successfully deleted.",
      });
      refetchAll();
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Error",
        description: "Failed to delete match.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournaments & Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalTournaments = upcomingTournaments.length + activeTournaments.length + completedTournaments.length;
  const totalMatches = pendingMatches.length + activeMatches.length + completedMatches.length;

  if (totalTournaments === 0 && totalMatches === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournaments & Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="relative mb-4">
              <Trophy className="h-16 w-16 text-muted-foreground/40 mx-auto" />
              <Swords className="h-8 w-8 text-muted-foreground/40 absolute -bottom-1 -right-1" />
            </div>
            <p className="text-muted-foreground font-medium">No tournaments or matches yet</p>
            <p className="text-xs text-muted-foreground mt-2">
              Create a tournament or challenge friends to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {viewMode === 'tournaments' ? (
                <Trophy className="h-5 w-5 text-amber-500" />
              ) : (
                <Swords className="h-5 w-5 text-red-500" />
              )}
              <CardTitle className="text-lg">
                {viewMode === 'tournaments' ? 'Tournaments' : 'Matches'}
              </CardTitle>
            </div>
          </div>
          
          {/* Mobile-optimized Toggle Buttons */}
          <div className="flex bg-muted p-1 rounded-lg w-full">
            <Button
              size="sm"
              variant={viewMode === 'tournaments' ? 'default' : 'ghost'}
              onClick={() => setViewMode('tournaments')}
              className="flex-1 h-9 text-xs justify-center"
            >
              <Trophy className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">Tournaments</span>
              <span className="xs:hidden">Tour.</span>
              {totalTournaments > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                  {totalTournaments}
                </Badge>
              )}
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'matches' ? 'default' : 'ghost'}
              onClick={() => setViewMode('matches')}
              className="flex-1 h-9 text-xs justify-center"
            >
              <Swords className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">Matches</span>
              <span className="xs:hidden">Match.</span>
              {totalMatches > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                  {totalMatches}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="active" className="flex items-center gap-1 text-xs py-1">
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">Active</span>
              <span className="sm:hidden">Act.</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-1 text-xs py-1">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Upcoming</span>
              <span className="sm:hidden">Up.</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1 text-xs py-1">
              <CheckCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">Done</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            {viewMode === 'tournaments' ? (
              <>
                {/* Active Tournaments */}
                {activeTournaments.map((tournament) => (
                  <InteractiveTournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onLoadScores={(tournament) => setTournamentScoringCard({ open: true, tournament })}
                    onEdit={(tournament) => setEditTournamentDialog({ open: true, tournament })}
                    onDelete={deleteTournament}
                  />
                ))}
                {activeTournaments.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No active tournaments</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Active Matches */}
                {activeMatches.map((match) => (
                  <InteractiveMatchCard
                    key={match.id}
                    match={match}
                    onLoadScores={(match) => setMatchScoringCard({ open: true, match })}
                    onEdit={(match) => setEditMatchDialog({ open: true, match })}
                    onDelete={deleteMatch}
                    onAccept={acceptMatch}
                    onDecline={declineMatch}
                    isAccepting={isAcceptingMatch}
                    isDeclining={isDecliningMatch}
                  />
                ))}
                {activeMatches.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Swords className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No active matches</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {viewMode === 'tournaments' ? (
              <>
                {/* Upcoming Tournaments */}
                {upcomingTournaments.map((tournament) => (
                  <InteractiveTournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onLoadScores={(tournament) => setTournamentScoringCard({ open: true, tournament })}
                    onEdit={(tournament) => setEditTournamentDialog({ open: true, tournament })}
                    onDelete={deleteTournament}
                  />
                ))}
                {upcomingTournaments.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming tournaments</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Pending Matches */}
                {pendingMatches.map((match) => (
                  <InteractiveMatchCard
                    key={match.id}
                    match={match}
                    onLoadScores={(match) => setMatchScoringCard({ open: true, match })}
                    onEdit={(match) => setEditMatchDialog({ open: true, match })}
                    onDelete={deleteMatch}
                    onAccept={acceptMatch}
                    onDecline={declineMatch}
                    isAccepting={isAcceptingMatch}
                    isDeclining={isDecliningMatch}
                  />
                ))}
                {pendingMatches.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Swords className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No pending matches</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {viewMode === 'tournaments' ? (
              <>
                {/* Completed Tournaments */}
                {completedTournaments.map((tournament) => (
                  <InteractiveTournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onLoadScores={(tournament) => setTournamentScoringCard({ open: true, tournament })}
                    onEdit={(tournament) => setEditTournamentDialog({ open: true, tournament })}
                    onDelete={deleteTournament}
                  />
                ))}
                {completedTournaments.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No completed tournaments</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Completed Matches */}
                {completedMatches.map((match) => (
                  <InteractiveMatchCard
                    key={match.id}
                    match={match}
                    onLoadScores={(match) => setMatchScoringCard({ open: true, match })}
                    onEdit={(match) => setEditMatchDialog({ open: true, match })}
                    onDelete={deleteMatch}
                    onAccept={acceptMatch}
                    onDecline={declineMatch}
                    isAccepting={isAcceptingMatch}
                    isDeclining={isDecliningMatch}
                  />
                ))}
                {completedMatches.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Swords className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No completed matches</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Edit Dialogs */}
      <EditTournamentDialog
        tournament={editTournamentDialog.tournament}
        open={editTournamentDialog.open}
        onOpenChange={(open) => setEditTournamentDialog({ open, tournament: null })}
        onSuccess={refetchAll}
      />

      <EditMatchDialog
        match={editMatchDialog.match}
        open={editMatchDialog.open}
        onOpenChange={(open) => setEditMatchDialog({ open, match: null })}
        onSuccess={refetchAll}
      />

      {/* Scoring Dialogs - Legacy */}
      <TournamentScoringDialog
        tournament={tournamentScoringDialog.tournament}
        open={tournamentScoringDialog.open}
        onOpenChange={(open) => setTournamentScoringDialog({ open, tournament: null })}
        onSuccess={refetchAll}
      />

      <MatchScoringDialog
        match={matchScoringDialog.match}
        open={matchScoringDialog.open}
        onOpenChange={(open) => setMatchScoringDialog({ open, match: null })}
        onSuccess={refetchAll}
      />

      {/* New Scoring Cards */}
      <TournamentScoringCard
        tournament={tournamentScoringCard.tournament}
        open={tournamentScoringCard.open}
        onOpenChange={(open) => setTournamentScoringCard({ open, tournament: null })}
        onSuccess={refetchAll}
      />

      <MatchScoringCard
        match={matchScoringCard.match}
        open={matchScoringCard.open}
        onOpenChange={(open) => setMatchScoringCard({ open, match: null })}
        onSuccess={refetchAll}
      />
    </Card>
  );
};