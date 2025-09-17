import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tournament } from "@/hooks/useTournamentsAndMatches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Trophy, Users } from "lucide-react";
import ScoreInput from "@/components/rounds/ScoreInput";
import HoleVisualization from "@/components/rounds/HoleVisualization";
import ScoreSummary from "@/components/rounds/ScoreSummary";

interface TournamentScoringCardProps {
  tournament: Tournament;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ParticipantScore {
  user_id: string;
  name: string;
  username: string;
  avatar_url?: string;
  hole_scores: number[];
  total_score: number;
}

export const TournamentScoringCard = ({ tournament, open, onOpenChange, onSuccess }: TournamentScoringCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<ParticipantScore[]>([]);
  const [coursePars, setCoursePars] = useState<number[]>([]);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);

  useEffect(() => {
    if (open && tournament?.id) {
      fetchParticipants();
      fetchCoursePars();
    }
  }, [open, tournament?.id]);

  const fetchParticipants = async () => {
    try {
      // First get participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('user_id')
        .eq('tournament_id', tournament.id)
        .eq('status', 'registered');

      if (participantsError) throw participantsError;

      if (!participantsData || participantsData.length === 0) {
        setParticipants([]);
        return;
      }

      // Then get profiles for those participants
      const userIds = participantsData.map(p => p.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const participantScores: ParticipantScore[] = participantsData.map(p => {
        const profile = profilesData?.find(profile => profile.id === p.user_id);
        return {
          user_id: p.user_id,
          name: profile?.full_name || profile?.username || 'Player',
          username: profile?.username || 'player',
          avatar_url: profile?.avatar_url,
          hole_scores: new Array(18).fill(0),
          total_score: 0,
        };
      });

      setParticipants(participantScores);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Error",
        description: "Failed to load tournament participants.",
        variant: "destructive"
      });
    }
  };

  const fetchCoursePars = async () => {
    try {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('hole_pars')
        .eq('id', tournament.course_id)
        .single();

      if (error) throw error;
      setCoursePars(data.hole_pars || new Array(18).fill(4));
    } catch (error) {
      console.error('Error fetching course pars:', error);
      setCoursePars(new Array(18).fill(4));
    }
  };

  const currentParticipant = participants[currentParticipantIndex];
  const currentPar = coursePars[currentHoleIndex] || 4;
  const currentScore = currentParticipant?.hole_scores[currentHoleIndex] || 0;
  const completedHoles = currentParticipant?.hole_scores.filter(score => score > 0).length || 0;

  const getScoreColor = (score: number, par: number): string => {
    if (score === 0) return 'text-muted-foreground';
    const diff = score - par;
    if (diff < 0) return 'text-green-500 dark:text-green-400';
    if (diff === 0) return 'text-blue-500 dark:text-blue-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getScoreTerm = (score: number, par: number): string => {
    if (score === 0) return '';
    const diff = score - par;
    if (diff === -2) return 'Eagle';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double Bogey';
    if (diff > 2) return 'Triple+';
    return '';
  };

  const incrementScore = () => {
    if (!currentParticipant) return;
    const newParticipants = [...participants];
    const newScore = (newParticipants[currentParticipantIndex].hole_scores[currentHoleIndex] || 0) + 1;
    newParticipants[currentParticipantIndex].hole_scores[currentHoleIndex] = Math.min(newScore, 15);
    newParticipants[currentParticipantIndex].total_score = newParticipants[currentParticipantIndex].hole_scores.reduce((sum, s) => sum + s, 0);
    setParticipants(newParticipants);
  };

  const decrementScore = () => {
    if (!currentParticipant) return;
    const newParticipants = [...participants];
    const currentScore = newParticipants[currentParticipantIndex].hole_scores[currentHoleIndex] || 0;
    if (currentScore > 0) {
      newParticipants[currentParticipantIndex].hole_scores[currentHoleIndex] = currentScore - 1;
      newParticipants[currentParticipantIndex].total_score = newParticipants[currentParticipantIndex].hole_scores.reduce((sum, s) => sum + s, 0);
      setParticipants(newParticipants);
    }
  };

  const goToNextHole = () => {
    if (currentScore === 0) {
      toast({
        title: "Enter a score",
        description: "Please enter a score for this hole before proceeding.",
        variant: "destructive"
      });
      return;
    }

    if (currentHoleIndex < 17) {
      setCurrentHoleIndex(currentHoleIndex + 1);
    } else {
      // Switch to next participant or complete round
      if (currentParticipantIndex < participants.length - 1) {
        setCurrentParticipantIndex(currentParticipantIndex + 1);
        setCurrentHoleIndex(0);
        toast({
          title: "Participant switch",
          description: `Now entering scores for ${participants[currentParticipantIndex + 1]?.name}`,
        });
      } else {
        toast({
          title: "Round Complete!",
          description: "All participants have completed their rounds. Ready to submit scores.",
        });
      }
    }
  };

  const goToPreviousHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1);
    } else if (currentParticipantIndex > 0) {
      setCurrentParticipantIndex(currentParticipantIndex - 1);
      setCurrentHoleIndex(17);
    }
  };

  const submitScores = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const scores = participants.map(p => ({
        tournament_id: tournament.id,
        participant_id: p.user_id,
        round_number: currentRound,
        hole_scores: p.hole_scores,
        total_score: p.total_score,
        submitted_by: user.id,
      }));

      const { error } = await supabase
        .from('tournament_scores')
        .upsert(scores, {
          onConflict: 'tournament_id,participant_id,round_number'
        });

      if (error) throw error;

      toast({
        title: "Scores Submitted",
        description: `Round ${currentRound} scores have been submitted successfully.`,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting scores:', error);
      toast({
        title: "Error",
        description: "Failed to submit scores. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAllParticipantsComplete = participants.every(participant => 
    participant.hole_scores.every(score => score > 0)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-amber-500" />
            {tournament?.name || "Tournament Scoring"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 space-y-4">
          {/* Round Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Round</label>
            <Select value={currentRound.toString()} onValueChange={(value) => setCurrentRound(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Round 1</SelectItem>
                <SelectItem value="2">Round 2</SelectItem>
                <SelectItem value="3">Round 3</SelectItem>
                <SelectItem value="4">Round 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Participant Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentParticipant?.avatar_url} />
                    <AvatarFallback>{currentParticipant?.name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{currentParticipant?.name}</div>
                    <div className="text-sm text-muted-foreground">@{currentParticipant?.username}</div>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {currentParticipantIndex + 1}/{participants.length}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedHoles}/18 holes</span>
            </div>
            <Progress value={(completedHoles / 18) * 100} className="h-2" />
          </div>

          {/* Course Name */}
          <div className="text-center">
            <h2 className="text-lg font-semibold">{tournament.golf_courses?.name}</h2>
          </div>

          {/* Score Summary */}
          <ScoreSummary
            currentTotal={currentParticipant?.total_score || 0}
            totalPar={coursePars.slice(0, completedHoles).reduce((sum, par) => sum + par, 0)}
            vsParScore={(currentParticipant?.total_score || 0) - coursePars.slice(0, completedHoles).reduce((sum, par) => sum + par, 0)}
          />

          {/* Hole Visualization */}
          <HoleVisualization
            currentHoleIndex={currentHoleIndex}
            holeOffset={0}
            currentPar={currentPar}
            currentScore={currentScore}
          />

          {/* Score Input */}
          <ScoreInput
            currentScore={currentScore}
            onIncrement={incrementScore}
            onDecrement={decrementScore}
            scoreColor={getScoreColor(currentScore, currentPar)}
            scoreTerm={getScoreTerm(currentScore, currentPar)}
          />

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={goToPreviousHole}
              disabled={currentHoleIndex === 0 && currentParticipantIndex === 0}
              className="flex-1 h-12"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={goToNextHole}
              disabled={!currentScore}
              className="flex-1 h-12"
            >
              {currentHoleIndex < 17 ? (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : currentParticipantIndex < participants.length - 1 ? (
                <>
                  Next Player
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Complete
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Submit Button */}
          {isAllParticipantsComplete && (
            <div className="pt-4 border-t">
              <Button 
                onClick={submitScores} 
                disabled={loading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {loading ? "Submitting..." : (
                  <>
                    <Trophy className="mr-2 h-5 w-5" />
                    Submit Round {currentRound} Results
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="pb-4" />
        </div>
      </DialogContent>
    </Dialog>
  );
};