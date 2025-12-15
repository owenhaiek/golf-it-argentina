import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Swords, Calendar, Clock, CheckCircle } from "lucide-react";
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
      <div className="w-full space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="font-semibold text-lg">Torneos y Partidos</span>
        </div>
        <div className="space-y-3">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-muted/30 rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-muted rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-muted rounded-xl" />
                <div className="h-16 bg-muted rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalTournaments = upcomingTournaments.length + activeTournaments.length + completedTournaments.length;
  const totalMatches = pendingMatches.length + activeMatches.length + completedMatches.length;

  if (totalTournaments === 0 && totalMatches === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="font-semibold text-lg">Torneos y Partidos</span>
        </div>
        <div className="bg-muted/30 rounded-2xl p-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="p-4 rounded-2xl bg-muted/50">
              <Trophy className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-muted">
              <Swords className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </div>
          <p className="text-foreground font-medium">Sin torneos o partidos</p>
          <p className="text-sm text-muted-foreground mt-1">
            Crea un torneo o desafía a tus amigos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {viewMode === 'tournaments' ? (
            <Trophy className="h-5 w-5 text-amber-500" />
          ) : (
            <Swords className="h-5 w-5 text-red-500" />
          )}
          <span className="font-semibold text-lg">
            {viewMode === 'tournaments' ? 'Torneos' : 'Partidos'}
          </span>
        </div>
      </div>
      
      {/* Mode Toggle */}
      <div className="flex bg-muted/50 p-1 rounded-xl w-full">
        <Button
          size="sm"
          variant={viewMode === 'tournaments' ? 'default' : 'ghost'}
          onClick={() => setViewMode('tournaments')}
          className={`flex-1 h-10 text-sm justify-center rounded-lg ${viewMode === 'tournaments' ? '' : 'hover:bg-white/5'}`}
        >
          <Trophy className="h-4 w-4 mr-2" />
          Torneos
          {totalTournaments > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs h-5 px-1.5 bg-white/10">
              {totalTournaments}
            </Badge>
          )}
        </Button>
        <Button
          size="sm"
          variant={viewMode === 'matches' ? 'default' : 'ghost'}
          onClick={() => setViewMode('matches')}
          className={`flex-1 h-10 text-sm justify-center rounded-lg ${viewMode === 'matches' ? '' : 'hover:bg-white/5'}`}
        >
          <Swords className="h-4 w-4 mr-2" />
          Partidos
          {totalMatches > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs h-5 px-1.5 bg-white/10">
              {totalMatches}
            </Badge>
          )}
        </Button>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-10 rounded-xl">
          <TabsTrigger value="active" className="flex items-center gap-1.5 text-xs rounded-lg">
            <Clock className="h-3.5 w-3.5" />
            <span>Activos</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-1.5 text-xs rounded-lg">
            <Calendar className="h-3.5 w-3.5" />
            <span>Próximos</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-1.5 text-xs rounded-lg">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Finalizados</span>
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
                  <div className="text-center py-8 bg-muted/30 rounded-2xl">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Sin torneos activos</p>
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
                  <div className="text-center py-8 bg-muted/30 rounded-2xl">
                    <Swords className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Sin partidos activos</p>
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
                  <div className="text-center py-8 bg-muted/30 rounded-2xl">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Sin torneos próximos</p>
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
                  <div className="text-center py-8 bg-muted/30 rounded-2xl">
                    <Swords className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Sin partidos pendientes</p>
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
                  <div className="text-center py-8 bg-muted/30 rounded-2xl">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Sin torneos finalizados</p>
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
                  <div className="text-center py-8 bg-muted/30 rounded-2xl">
                    <Swords className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Sin partidos finalizados</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

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
    </div>
  );
};