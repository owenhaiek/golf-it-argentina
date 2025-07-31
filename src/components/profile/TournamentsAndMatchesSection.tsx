import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Swords, Calendar, MapPin, Users, Crown, Clock, CheckCircle } from "lucide-react";
import { useTournamentsAndMatches } from "@/hooks/useTournamentsAndMatches";
import { formatDistanceToNow, format } from "date-fns";

export const TournamentsAndMatchesSection = () => {
  const {
    upcomingTournaments,
    activeTournaments,
    completedTournaments,
    pendingMatches,
    activeMatches,
    completedMatches,
    isLoading
  } = useTournamentsAndMatches();

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
            <Trophy className="h-5 w-5 text-amber-500" />
            Tournaments & Matches
          </div>
          <div className="flex gap-2">
            {totalTournaments > 0 && (
              <Badge variant="outline" className="text-xs">
                {totalTournaments} tournaments
              </Badge>
            )}
            {totalMatches > 0 && (
              <Badge variant="outline" className="text-xs">
                {totalMatches} matches
              </Badge>
            )}
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
            {/* Active Tournaments */}
            {activeTournaments.map((tournament) => (
              <div key={tournament.id} className="p-3 rounded-lg border bg-gradient-to-r from-amber-50 to-transparent hover:from-amber-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{tournament.name}</span>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    Active Tournament
                  </Badge>
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

            {/* Active Matches */}
            {activeMatches.map((match) => (
              <div key={match.id} className="p-3 rounded-lg border bg-gradient-to-r from-red-50 to-transparent hover:from-red-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Swords className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{match.name}</span>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    Active Match
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

            {activeTournaments.length === 0 && activeMatches.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active tournaments or matches</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {/* Upcoming Tournaments */}
            {upcomingTournaments.map((tournament) => (
              <div key={tournament.id} className="p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-medium">{tournament.name}</span>
                  </div>
                  <Badge variant="outline">
                    {format(new Date(tournament.start_date), 'MMM d')}
                  </Badge>
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

            {/* Pending Matches */}
            {pendingMatches.map((match) => (
              <div key={match.id} className="p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Swords className="h-4 w-4 text-primary" />
                    <span className="font-medium">{match.name}</span>
                  </div>
                  <Badge variant="outline">
                    Pending
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

            {upcomingTournaments.length === 0 && pendingMatches.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming events</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
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

            {completedTournaments.length === 0 && completedMatches.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No completed events yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};