
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Calendar, Flag, GolfClub } from "lucide-react";
import { formatRelative } from "date-fns";
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
      <div className="animate-pulse">
        <div className="h-6 w-1/3 bg-secondary/20 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-secondary/20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Rounds</CardTitle>
      </CardHeader>
      <CardContent>
        {rounds && rounds.length > 0 ? (
          <div className="space-y-4">
            {rounds.map((round) => {
              const totalPar = round.golf_courses.hole_pars
                ?.slice(0, round.golf_courses.holes)
                .reduce((a, b) => a + b, 0) || 0;
              const vsParScore = round.score - totalPar;
              const isDeleting = deletingRoundId === round.id;
              
              return (
                <div 
                  key={round.id} 
                  className="flex justify-between items-start p-3 bg-secondary/10 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{round.golf_courses.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(round.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-right space-y-1">
                      <div className="text-lg font-bold">
                        Score: {round.score}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Course Par: {totalPar}
                      </p>
                      <p className={`text-sm ${vsParScore <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {vsParScore <= 0 ? '' : '+' }{vsParScore} vs Par
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:bg-red-600/10 transition-colors"
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
          <div className="text-center text-muted-foreground">
            No rounds recorded yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentRounds;
