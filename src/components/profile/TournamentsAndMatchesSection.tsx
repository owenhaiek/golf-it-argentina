import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Swords, Calendar, CheckCircle, Flame, ChevronRight, AlertTriangle } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type FilterType = 'all' | 'active' | 'upcoming' | 'completed';

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

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [editTournamentDialog, setEditTournamentDialog] = useState<{ open: boolean; tournament: any }>({ open: false, tournament: null });
  const [editMatchDialog, setEditMatchDialog] = useState<{ open: boolean; match: any }>({ open: false, match: null });
  const [tournamentScoringDialog, setTournamentScoringDialog] = useState<{ open: boolean; tournament: any }>({ open: false, tournament: null });
  const [matchScoringDialog, setMatchScoringDialog] = useState<{ open: boolean; match: any }>({ open: false, match: null });
  const [tournamentScoringCard, setTournamentScoringCard] = useState<{ open: boolean; tournament: any }>({ open: false, tournament: null });
  const [matchScoringCard, setMatchScoringCard] = useState<{ open: boolean; match: any }>({ open: false, match: null });
  
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'tournament' | 'match';
    id: string;
    name: string;
  }>({ open: false, type: 'tournament', id: '', name: '' });

  const handleDeleteConfirm = async () => {
    if (deleteDialog.type === 'tournament') {
      await deleteTournament(deleteDialog.id);
    } else {
      await deleteMatch(deleteDialog.id);
    }
    setDeleteDialog({ open: false, type: 'tournament', id: '', name: '' });
  };

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

  // Combine all items with type indicator
  const allItems = [
    ...activeTournaments.map(t => ({ ...t, itemType: 'tournament' as const, status: 'active' as const })),
    ...activeMatches.map(m => ({ ...m, itemType: 'match' as const, status: 'active' as const })),
    ...upcomingTournaments.map(t => ({ ...t, itemType: 'tournament' as const, status: 'upcoming' as const })),
    ...completedTournaments.map(t => ({ ...t, itemType: 'tournament' as const, status: 'completed' as const })),
    ...completedMatches.map(m => ({ ...m, itemType: 'match' as const, status: 'completed' as const })),
  ];

  // Filter items based on active filter
  const filteredItems = activeFilter === 'all' 
    ? allItems 
    : allItems.filter(item => item.status === activeFilter);

  const totalTournaments = upcomingTournaments.length + activeTournaments.length + completedTournaments.length;
  const totalMatches = activeMatches.length + completedMatches.length;
  const activeCount = activeTournaments.length + activeMatches.length;
  const upcomingCount = upcomingTournaments.length;
  const completedCount = completedTournaments.length + completedMatches.length;

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
            </div>
          ))}
        </div>
      </div>
    );
  }

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

  const filters: { key: FilterType; label: string; icon: any; count: number; color: string }[] = [
    { key: 'all', label: 'Todos', icon: null, count: allItems.length, color: 'bg-zinc-500/20 text-zinc-400' },
    { key: 'active', label: 'Activos', icon: Flame, count: activeCount, color: 'bg-emerald-500/20 text-emerald-400' },
    { key: 'upcoming', label: 'Próximos', icon: Calendar, count: upcomingCount, color: 'bg-blue-500/20 text-blue-400' },
    { key: 'completed', label: 'Finalizados', icon: CheckCircle, count: completedCount, color: 'bg-zinc-500/20 text-zinc-400' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/10">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <span className="font-semibold text-lg text-foreground">Torneos y Partidos</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-400 border-amber-500/20">
                {totalTournaments} torneos
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-400 border-red-500/20">
                {totalMatches} partidos
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {filters.map(({ key, label, icon: Icon, count, color }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === key
                ? `${color} ring-1 ring-current/30`
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {label}
            {count > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeFilter === key ? 'bg-background/20' : 'bg-muted'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 bg-card rounded-2xl border border-border/50"
            >
              <div className="flex justify-center mb-2 opacity-50">
                {activeFilter === 'active' && <Flame className="h-8 w-8 text-emerald-500" />}
                {activeFilter === 'upcoming' && <Calendar className="h-8 w-8 text-blue-500" />}
                {activeFilter === 'completed' && <CheckCircle className="h-8 w-8 text-zinc-500" />}
                {activeFilter === 'all' && <Trophy className="h-8 w-8 text-amber-500" />}
              </div>
              <p className="text-muted-foreground text-sm">
                {activeFilter === 'active' && 'Sin eventos activos'}
                {activeFilter === 'upcoming' && 'Sin eventos próximos'}
                {activeFilter === 'completed' && 'Sin eventos finalizados'}
                {activeFilter === 'all' && 'Sin eventos'}
              </p>
            </motion.div>
          ) : (
            filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
              >
                {item.itemType === 'tournament' ? (
                  <InteractiveTournamentCard
                    tournament={item}
                    onLoadScores={(tournament) => setTournamentScoringCard({ open: true, tournament })}
                    onEdit={(tournament) => setEditTournamentDialog({ open: true, tournament })}
                    onDelete={(tournamentId) => {
                      const tournament = [...upcomingTournaments, ...activeTournaments, ...completedTournaments].find(t => t.id === tournamentId);
                      setDeleteDialog({ open: true, type: 'tournament', id: tournamentId, name: tournament?.name || 'este torneo' });
                    }}
                  />
                ) : (
                  <InteractiveMatchCard
                    match={item}
                    onLoadScores={(match) => setMatchScoringCard({ open: true, match })}
                    onEdit={(match) => setEditMatchDialog({ open: true, match })}
                    onDelete={(matchId) => {
                      const match = [...activeMatches, ...completedMatches].find(m => m.id === matchId);
                      setDeleteDialog({ open: true, type: 'match', id: matchId, name: match?.name || 'este partido' });
                    }}
                  />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog(prev => ({ ...prev, open: false }))}>
        <AlertDialogContent className="bg-card border-border rounded-2xl max-w-sm mx-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold">
                Eliminar {deleteDialog.type === 'tournament' ? 'Torneo' : 'Partido'}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground">
              ¿Estás seguro de que deseas eliminar <span className="font-medium text-foreground">"{deleteDialog.name}"</span>? 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="flex-1 h-11 rounded-xl bg-muted/50 border-border hover:bg-muted">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="flex-1 h-11 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
