import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Swords, Calendar, MapPin, Users, Crown, Clock, CheckCircle, Edit, Trash2, Play, Target } from "lucide-react";
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
    refetchAll
  } = useTournamentsAndMatches();

  const [viewMode, setViewMode] = useState<ViewMode>('tournaments');
  const [editTournamentDialog, setEditTournamentDialog] = useState<{ open: boolean; tournament: any }>({ open: false, tournament: null });
  const [editMatchDialog, setEditMatchDialog] = useState<{ open: boolean; match: any }>({ open: false, match: null });
  const [tournamentScoringDialog, setTournamentScoringDialog] = useState<{ open: boolean; tournament: any }>({ open: false, tournament: null });
  const [matchScoringDialog, setMatchScoringDialog] = useState<{ open: boolean; match: any }>({ open: false, match: null });

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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {viewMode === 'tournaments' ? (
              <Trophy className="h-5 w-5 text-amber-500" />
            ) : (
              <Swords className="h-5 w-5 text-red-500" />
            )}
            {viewMode === 'tournaments' ? 'Tournaments' : 'Matches'}
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle Buttons */}
            <div className="flex bg-muted p-1 rounded-lg">
              <Button
                size="sm"
                variant={viewMode === 'tournaments' ? 'default' : 'ghost'}
                onClick={() => setViewMode('tournaments')}
                className="h-8 px-3 text-xs"
              >
                <Trophy className="h-3 w-3 mr-1" />
                Tournaments
                {totalTournaments > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs h-4 px-1">
                    {totalTournaments}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'matches' ? 'default' : 'ghost'}
                onClick={() => setViewMode('matches')}
                className="h-8 px-3 text-xs"
              >
                <Swords className="h-3 w-3 mr-1" />
                Matches
                {totalMatches > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs h-4 px-1">
                    {totalMatches}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Active
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            {viewMode === 'tournaments' ? (
              <>
                {/* Active Tournaments */}
                {activeTournaments.map((tournament) => (
              <div key={tournament.id} className="p-3 rounded-lg border bg-gradient-to-r from-amber-50 to-transparent hover:from-amber-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{tournament.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      Active Tournament
                    </Badge>
                    {tournament.creator_id === user?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTournamentScoringDialog({ open: true, tournament })}
                        className="h-7 px-2"
                      >
                        <Target className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {tournament.golf_courses?.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {tournament.tournament_participants?.length || 0} players
                  </div>
                </div>
              </div>
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
                  <div key={match.id} className="p-3 rounded-lg border bg-gradient-to-r from-red-50 to-transparent hover:from-red-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Swords className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{match.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          Active Match
                        </Badge>
                        {(match.creator_id === user?.id || match.opponent_id === user?.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setMatchScoringDialog({ open: true, match })}
                            className="h-7 px-2"
                          >
                            <Target className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.golf_courses?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(match.match_date), 'MMM d')}
                      </div>
                    </div>
                  </div>
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
              <div key={tournament.id} className="p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-medium">{tournament.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {format(new Date(tournament.start_date), 'MMM d')}
                    </Badge>
                    {tournament.creator_id === user?.id && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditTournamentDialog({ open: true, tournament })}
                          className="h-7 px-2"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-destructive hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{tournament.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteTournament(tournament.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {tournament.golf_courses?.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {tournament.tournament_participants?.length || 0}/{tournament.max_players}
                  </div>
                </div>
              </div>
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
                  <div key={match.id} className="p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Swords className="h-4 w-4 text-primary" />
                        <span className="font-medium">{match.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Pending
                        </Badge>
                        {match.creator_id === user?.id && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditMatchDialog({ open: true, match })}
                              className="h-7 px-2"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-7 px-2 text-destructive hover:text-destructive">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Match</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{match.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMatch(match.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.golf_courses?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(match.match_date), 'MMM d')}
                      </div>
                    </div>
                  </div>
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
                  <div key={tournament.id} className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">{tournament.name}</span>
                      </div>
                      <Badge variant="secondary">
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {tournament.golf_courses?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(tournament.start_date), 'MMM d')}
                      </div>
                    </div>
                  </div>
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
                  <div key={match.id} className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Swords className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">{match.name}</span>
                      </div>
                      <Badge variant="secondary">
                        {match.winner_id ? 'Finished' : 'Completed'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.golf_courses?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(match.match_date), 'MMM d')}
                      </div>
                    </div>
                  </div>
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

      {/* Scoring Dialogs */}
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
    </Card>
  );
};