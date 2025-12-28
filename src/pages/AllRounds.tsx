import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
import { format } from "date-fns";
import { Trophy, Calendar, Loader2, Trash2, Eye, Plus, Minus, Check, Flag, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import RoundScoreDialog from "@/components/profile/RoundScoreDialog";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

const AllRounds = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [selectedRound, setSelectedRound] = useState<any>(null);
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState<string | null>(null);
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);

  const { data: rounds, isLoading } = useQuery({
    queryKey: ['allRounds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          golf_courses (
            name,
            hole_pars,
            holes,
            image_url,
            address,
            city,
            state,
            par
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const calculateRoundPar = (round: any) => {
    const fullCoursePar = round.golf_courses?.par || 72;
    if (round.notes && round.notes.includes('9 holes played')) {
      if (round.golf_courses?.hole_pars && round.golf_courses.hole_pars.length >= 18) {
        if (round.notes.includes('(front 9)')) {
          return round.golf_courses.hole_pars.slice(0, 9).reduce((a: number, b: number) => a + b, 0);
        } else if (round.notes.includes('(back 9)')) {
          return round.golf_courses.hole_pars.slice(9, 18).reduce((a: number, b: number) => a + b, 0);
        }
      }
      return Math.round(fullCoursePar / 2);
    }
    return fullCoursePar;
  };

  const handleViewRoundScore = (round: any) => {
    setSelectedRound(round);
    setIsScoreDialogOpen(true);
  };

  const handleDeleteClick = (roundId: string) => {
    setRoundToDelete(roundId);
  };

  const handleDeleteRound = async (roundId: string) => {
    try {
      setDeletingRoundId(roundId);
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Ronda eliminada",
        description: "La ronda ha sido eliminada exitosamente.",
      });

      queryClient.invalidateQueries({ queryKey: ['allRounds'] });
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
    } catch (error) {
      console.error('Error deleting round:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la ronda.",
        variant: "destructive",
      });
    } finally {
      setDeletingRoundId(null);
    }
  };

  const confirmDelete = () => {
    if (roundToDelete) {
      handleDeleteRound(roundToDelete);
      setRoundToDelete(null);
    }
  };

  const cancelDelete = () => {
    setRoundToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40"
        >
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/profile')} 
              className="rounded-full bg-muted/50 hover:bg-muted/70"
            >
              <ArrowLeft size={16} className="text-muted-foreground" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">{t("profile", "allRounds")}</h1>
          </div>
        </motion.div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40"
      >
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/profile')} 
            className="rounded-full bg-muted/50 hover:bg-muted/70"
          >
            <ArrowLeft size={16} className="text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{t("profile", "allRounds")}</h1>
            <p className="text-xs text-muted-foreground">{rounds?.length || 0} {t("profile", "totalRounds").toLowerCase()}</p>
          </div>
        </div>
      </motion.div>
      
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-3 pb-28">
          {!rounds || rounds.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-zinc-900/80 backdrop-blur-xl p-8 text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Flag className="h-8 w-8 text-primary/50" />
              </div>
              <p className="text-muted-foreground mb-4">{t("profile", "noRoundsRecorded")}</p>
              <Button 
                onClick={() => navigate('/add-round')}
                className="bg-primary hover:bg-primary/90"
              >
                {t("profile", "recordFirstRound")}
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {rounds.map((round, index) => {
                const coursePar = calculateRoundPar(round);
                const scoreDiff = round.score - coursePar;
                
                let scoreColor;
                let scoreBgColor;
                let ScoreIcon;
                let scoreLabel;
                
                if (scoreDiff < 0) {
                  scoreColor = "text-green-400";
                  scoreBgColor = "bg-green-500/20";
                  ScoreIcon = Minus;
                  scoreLabel = Math.abs(scoreDiff);
                } else if (scoreDiff > 0) {
                  scoreColor = "text-red-400";
                  scoreBgColor = "bg-red-500/20";
                  ScoreIcon = Plus;
                  scoreLabel = scoreDiff;
                } else {
                  scoreColor = "text-blue-400";
                  scoreBgColor = "bg-blue-500/20";
                  ScoreIcon = Check;
                  scoreLabel = "E";
                }

                const holesPlayed = round.notes?.includes('9 holes') ? '9H' : 
                                   round.notes?.includes('18 holes') ? '18H' : 
                                   round.notes?.includes('27 holes') ? '27H' : '18H';

                return (
                  <motion.div
                    key={round.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    className="group relative overflow-hidden rounded-2xl bg-zinc-900/80 backdrop-blur-xl"
                  >
                    {round.golf_courses?.image_url && (
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                        <img 
                          src={round.golf_courses.image_url} 
                          alt={round.golf_courses.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent" />
                      </div>
                    )}
                    
                    <div className="relative p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={`h-16 w-16 rounded-2xl ${scoreBgColor} flex flex-col items-center justify-center`}>
                            <span className="text-2xl font-bold text-foreground">{round.score}</span>
                            <div className={`flex items-center text-xs font-medium ${scoreColor}`}>
                              <ScoreIcon className="h-3 w-3" />
                              <span>{scoreLabel}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-base leading-tight truncate">
                            {round.golf_courses?.name || "Unknown Course"}
                          </h3>
                          
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(round.date), "d MMM, yyyy")}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                              {holesPlayed}
                            </span>
                            <span className="text-zinc-500">
                              Par {coursePar}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRoundScore(round)}
                              className="h-8 px-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-foreground text-xs"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              {t("profile", "viewScorecard")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(round.id)}
                              disabled={deletingRoundId === round.id}
                              className="h-8 w-8 p-0 rounded-lg bg-zinc-800/80 hover:bg-red-500/20 hover:text-red-400 text-muted-foreground"
                            >
                              {deletingRoundId === round.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      <RoundScoreDialog
        round={selectedRound}
        isOpen={isScoreDialogOpen}
        onClose={() => setIsScoreDialogOpen(false)}
      />

      <AlertDialog open={!!roundToDelete} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("profile", "deleteRound")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("profile", "deleteRoundConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={cancelDelete}
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
            >
              {t("common", "cancel")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {t("common", "delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AllRounds;
