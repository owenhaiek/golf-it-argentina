import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Swords, Calendar, Clock, CheckCircle, Flame } from "lucide-react";
import { useTournamentsAndMatches } from "@/hooks/useTournamentsAndMatches";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
    activeMatches,
    completedMatches,
    isLoading,
    refetchAll
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
        title: "Torneo Eliminado",
        description: "El torneo ha sido eliminado exitosamente.",
      });
      refetchAll();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el torneo.",
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
        title: "Partido Eliminado",
        description: "El partido ha sido eliminado exitosamente.",
      });
      refetchAll();
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el partido.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <span className="font-semibold text-lg text-foreground">Torneos y Partidos</span>
        </div>
        <div className="space-y-3">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl p-4 border border-border/50 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-muted rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
              <div className="h-10 bg-muted rounded-lg mb-3" />
              <div className="h-20 bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalTournaments = upcomingTournaments.length + activeTournaments.length + completedTournaments.length;
  const totalMatches = activeMatches.length + completedMatches.length;

  if (totalTournaments === 0 && totalMatches === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <span className="font-semibold text-lg text-foreground">Torneos y Partidos</span>
        </div>
        <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
          <div className="relative inline-block mb-4">
            <div className="p-4 rounded-2xl bg-muted">
              <Trophy className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-muted border-2 border-background">
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
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl transition-colors ${viewMode === 'tournaments' ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
          {viewMode === 'tournaments' ? (
            <Trophy className="h-5 w-5 text-amber-500" />
          ) : (
            <Swords className="h-5 w-5 text-red-500" />
          )}
        </div>
        <span className="font-semibold text-lg text-foreground">
          {viewMode === 'tournaments' ? 'Torneos' : 'Partidos'}
        </span>
      </div>
      
      {/* Mode Toggle */}
      <div className="flex bg-muted/50 p-1 rounded-xl w-full border border-border/50">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setViewMode('tournaments')}
          className={`flex-1 h-10 text-sm justify-center rounded-lg transition-all ${
            viewMode === 'tournaments' 
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 shadow-sm' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Trophy className="h-4 w-4 mr-2" />
          Torneos
          {totalTournaments > 0 && (
            <Badge className={`ml-2 text-xs h-5 px-1.5 border-0 ${
              viewMode === 'tournaments' 
                ? 'bg-amber-500/30 text-amber-300' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {totalTournaments}
            </Badge>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setViewMode('matches')}
          className={`flex-1 h-10 text-sm justify-center rounded-lg transition-all ${
            viewMode === 'matches' 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 shadow-sm' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Swords className="h-4 w-4 mr-2" />
          Partidos
          {totalMatches > 0 && (
            <Badge className={`ml-2 text-xs h-5 px-1.5 border-0 ${
              viewMode === 'matches' 
                ? 'bg-red-500/30 text-red-300' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {totalMatches}
            </Badge>
          )}
        </Button>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-10 rounded-xl bg-muted/50 border border-border/50 p-1">
          <TabsTrigger 
            value="active" 
            className="flex items-center gap-1.5 text-xs rounded-lg data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Activos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming" 
            className="flex items-center gap-1.5 text-xs rounded-lg data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Próximos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="flex items-center gap-1.5 text-xs rounded-lg data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Finalizados</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-4">
          {viewMode === 'tournaments' ? (
            <>
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
                <EmptyState 
                  icon={<Trophy className="h-8 w-8 text-zinc-600" />}
                  message="Sin torneos activos"
                />
              )}
            </>
          ) : (
            <>
              {activeMatches.map((match) => (
                <InteractiveMatchCard
                  key={match.id}
                  match={match}
                  onLoadScores={(match) => setMatchScoringCard({ open: true, match })}
                  onEdit={(match) => setEditMatchDialog({ open: true, match })}
                  onDelete={deleteMatch}
                />
              ))}
              {activeMatches.length === 0 && (
                <EmptyState 
                  icon={<Swords className="h-8 w-8 text-zinc-600" />}
                  message="Sin partidos activos"
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-3 mt-4">
          {viewMode === 'tournaments' ? (
            <>
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
                <EmptyState 
                  icon={<Trophy className="h-8 w-8 text-zinc-600" />}
                  message="Sin torneos próximos"
                />
              )}
            </>
          ) : (
            <EmptyState 
              icon={<Swords className="h-8 w-8 text-zinc-600" />}
              message="Los partidos se crean directamente como activos"
            />
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {viewMode === 'tournaments' ? (
            <>
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
                <EmptyState 
                  icon={<Trophy className="h-8 w-8 text-zinc-600" />}
                  message="Sin torneos finalizados"
                />
              )}
            </>
          ) : (
            <>
              {completedMatches.map((match) => (
                <InteractiveMatchCard
                  key={match.id}
                  match={match}
                  onLoadScores={(match) => setMatchScoringCard({ open: true, match })}
                  onEdit={(match) => setEditMatchDialog({ open: true, match })}
                  onDelete={deleteMatch}
                />
              ))}
              {completedMatches.length === 0 && (
                <EmptyState 
                  icon={<Swords className="h-8 w-8 text-zinc-600" />}
                  message="Sin partidos finalizados"
                />
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

// Empty state component
const EmptyState = ({ icon, message }: { icon: React.ReactNode; message: string }) => (
  <div className="text-center py-8 bg-card rounded-2xl border border-border/50">
    <div className="flex justify-center mb-2 opacity-50">{icon}</div>
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);
