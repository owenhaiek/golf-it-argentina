import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Calendar, Trophy, MapPin, Flag, Plus, Minus, Check } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Round {
  id: string;
  score: number;
  created_at: string;
  date: string;
  golf_courses: {
    name: string;
    hole_pars: number[];
    holes: number;
    image_url?: string;
    address?: string;
    city?: string;
    state?: string;
    par?: number;
  };
}

interface RecentRoundsProps {
  userId: string;
  rounds: Round[] | null;
  roundsLoading: boolean;
}

const RecentRounds = ({
  userId,
  rounds,
  roundsLoading
}: RecentRoundsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);

  // Calculate total par for a course
  const calculateCoursePar = (holePars: number[] | undefined): number => {
    if (!holePars || holePars.length === 0) return 0;
    return holePars.reduce((sum, par) => sum + par, 0);
  };

  // Round Deletion Mutation
  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId: string) => {
      if (!userId) throw new Error("User not authenticated");
      
      // Delete the round
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', userId);
      
      if (error) {
        console.error("Round deletion failed:", error);
        throw error;
      }
      
      return roundId;
    },
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['rounds', userId] });
      
      // Snapshot the previous value
      const previousRounds = queryClient.getQueryData<Round[]>(['rounds', userId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData<Round[]>(['rounds', userId], old => {
        return old ? old.filter(round => round.id !== deletedId) : [];
      });
      
      return { previousRounds };
    },
    onSuccess: () => {
      toast({
        title: "Round deleted successfully",
        description: "Your round has been removed from your history"
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['rounds', userId] });
    },
    onError: (error, _, context) => {
      // Revert back to the previous rounds on error
      if (context?.previousRounds) {
        queryClient.setQueryData(['rounds', userId], context.previousRounds);
      }
      
      console.error('Round deletion error:', error);
      toast({
        title: "Failed to delete round",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setDeletingRoundId(null);
    }
  });

  // Handle round deletion with confirmation
  const handleDeleteRound = (roundId: string) => {
    // Set the deleting state immediately to prevent double-clicks
    setDeletingRoundId(roundId);
    
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this round? This cannot be undone.');
    
    if (confirmed) {
      deleteRoundMutation.mutate(roundId);
    } else {
      // Reset deleting state if user cancels
      setDeletingRoundId(null);
    }
  };

  if (roundsLoading) {
    return <Card className="border-0 shadow-md h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">Your Recent Rounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-secondary/10 rounded-lg animate-pulse" />)}
          </div>
        </CardContent>
      </Card>;
  }

  return <Card className="border-0 shadow-md overflow-hidden h-full">
      <CardHeader className="border-b border-muted/20 pb-4">
        <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          Your Recent Rounds
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 py-[6px]">
        {rounds && rounds.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
            {rounds.map(round => {
              const isDeleting = deletingRoundId === round.id;
              const formattedDate = format(new Date(round.date || round.created_at), 'MMM d, yyyy');
              const coursePar = round.golf_courses.par || calculateCoursePar(round.golf_courses.hole_pars);
              const scoreDiff = round.score - coursePar;
              
              let scoreStatus;
              let scoreColor;
              let ScoreIcon;
              
              if (scoreDiff < 0) {
                scoreStatus = `${Math.abs(scoreDiff)} under par`;
                scoreColor = "text-green-600";
                ScoreIcon = Minus;
              } else if (scoreDiff > 0) {
                scoreStatus = `${scoreDiff} over par`;
                scoreColor = "text-red-600";
                ScoreIcon = Plus;
              } else {
                scoreStatus = "at par";
                scoreColor = "text-blue-600";
                ScoreIcon = Check;
              }

              return (
                <div key={round.id} className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-muted/10 flex flex-col">
                  {/* Image Section */}
                  <div className="relative">
                    {round.golf_courses.image_url ? (
                      <div className="w-full h-32 overflow-hidden">
                        <img src={round.golf_courses.image_url} alt={round.golf_courses.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-r from-secondary/30 to-primary/20 flex items-center justify-center">
                        <Trophy className="h-10 w-10 text-primary/40" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formattedDate}
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-4 flex-grow flex flex-col">
                    <div>
                      <h3 className="font-semibold text-lg text-primary mb-1">{round.golf_courses.name}</h3>
                      {round.golf_courses.city && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                          <MapPin className="h-3 w-3" /> 
                          {[round.golf_courses.address, round.golf_courses.city, round.golf_courses.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{round.golf_courses.holes} holes</span>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-sm text-muted-foreground mb-1">Total Score</div>
                        <div className="text-2xl font-bold text-primary">
                          {round.score}
                        </div>
                        
                        {/* Vs Par Display */}
                        <div className={`flex items-center gap-1 text-sm font-medium ${scoreColor}`}>
                          <ScoreIcon className="h-3 w-3" />
                          <span>{scoreStatus}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-3 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full cursor-pointer" 
                      onClick={() => handleDeleteRound(round.id)} 
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Round
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No rounds recorded yet</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate('/add-round')}>
              Add Your First Round
            </Button>
          </div>
        )}
      </CardContent>
    </Card>;
};

export default RecentRounds;
