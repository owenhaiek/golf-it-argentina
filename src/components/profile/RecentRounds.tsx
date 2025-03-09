
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Calendar, Trophy, MapPin, Flag } from "lucide-react";
import { formatRelative, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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
      // Update local state immediately for better UX
      queryClient.setQueryData(['rounds', userId], (oldData: any) => {
        if (!oldData) return [];
        return oldData.filter((round: Round) => round.id !== deletedRoundId);
      });
      
      // Then invalidate to get fresh data from the server
      queryClient.invalidateQueries({ queryKey: ['rounds', userId] });
      
      toast({
        title: "Round deleted successfully",
        description: "Your round has been removed from your history",
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
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
                  className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-muted/10 flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative">
                    {round.golf_courses.image_url ? (
                      <div className="w-full h-32 overflow-hidden">
                        <img 
                          src={round.golf_courses.image_url} 
                          alt={round.golf_courses.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
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
                          {[round.golf_courses.address, round.golf_courses.city].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{round.golf_courses.holes} holes</span>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-2xl font-bold text-primary">
                          {round.score}
                        </div>
                        <Badge className={`mt-1 ${vsParScore <= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                          {vsParScore <= 0 ? '' : '+' }{vsParScore}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
                      onClick={() => handleDeleteRound(round.id)}
                      disabled={isDeleting || deleteRoundMutation.isPending}
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
