
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Calendar, Flag, Trophy } from "lucide-react";
import { formatRelative, format } from "date-fns";
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
  };
}

interface RecentRoundsProps {
  userId: string;
  rounds: Round[] | null;
  roundsLoading: boolean;
}

const RecentRounds = ({ userId, rounds, roundsLoading }: RecentRoundsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);

  // Round Deletion Mutation
  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId: string) => {
      if (!userId) throw new Error("User not authenticated");
      
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
    onSuccess: (deletedRoundId) => {
      // Invalidate and refetch rounds data to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ['rounds', userId] });
      
      // Show success message
      toast({
        title: "Round deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Round deletion error:', error);
      toast({
        title: "Failed to delete round",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingRoundId(null);
    },
  });

  // Handle round deletion
  const handleDeleteRound = (roundId: string) => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this round? This cannot be undone.')) {
      setDeletingRoundId(roundId);
      deleteRoundMutation.mutate(roundId);
    }
  };

  if (roundsLoading) {
    return (
      <Card className="border-0 shadow-md h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">Your Recent Rounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-secondary/10 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md overflow-hidden h-full">
      <CardHeader className="border-b border-muted/20 pb-4">
        <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          Your Recent Rounds
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {rounds && rounds.length > 0 ? (
          <div className="space-y-4">
            {rounds.map((round) => {
              const totalPar = round.golf_courses.hole_pars
                ?.slice(0, round.golf_courses.holes)
                .reduce((a, b) => a + b, 0) || 0;
              const vsParScore = round.score - totalPar;
              const isDeleting = deletingRoundId === round.id;
              
              const formattedDate = format(new Date(round.date || round.created_at), 'MMM d, yyyy');
              
              return (
                <div 
                  key={round.id} 
                  className="group relative flex flex-col md:flex-row md:justify-between md:items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-muted/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="hidden md:flex h-12 w-12 rounded-full bg-secondary/10 items-center justify-center">
                      <Flag className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-primary">{round.golf_courses.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formattedDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 md:mt-0">
                    <div className="text-right space-y-1">
                      <div className="text-xl font-bold text-primary">
                        {round.score}
                      </div>
                      <div className="flex flex-col md:flex-row items-end md:items-center md:gap-2">
                        <span className="text-xs text-muted-foreground">
                          Par: {totalPar}
                        </span>
                        <span className={`text-sm font-medium ${vsParScore <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {vsParScore <= 0 ? '' : '+' }{vsParScore}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => handleDeleteRound(round.id)}
                      disabled={isDeleting || deleteRoundMutation.isPending}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
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
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => navigate('/add-round')}
            >
              Add Your First Round
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentRounds;
