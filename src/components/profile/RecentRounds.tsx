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
import { Trophy, Calendar, Loader2, Trash2, Eye, Plus, Minus, Check, Flag, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfileQueries } from "@/hooks/useProfileQueries";
import { useState } from "react";
import RoundScoreDialog from "./RoundScoreDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const RecentRounds = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { rounds, roundsLoading, deletingRoundId, handleDeleteRound } = useProfileQueries();
  const [selectedRound, setSelectedRound] = useState<any>(null);
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState<string | null>(null);

  // Helper function to calculate the correct par for a round
  const calculateRoundPar = (round: any) => {
    const fullCoursePar = round.golf_courses?.par || 72;
    
    // Check if this is a 9-hole round from the notes
    if (round.notes && round.notes.includes('9 holes played')) {
      if (round.golf_courses?.hole_pars && round.golf_courses.hole_pars.length >= 18) {
        // Calculate front 9 or back 9 par based on notes
        if (round.notes.includes('(front 9)')) {
          return round.golf_courses.hole_pars.slice(0, 9).reduce((a: number, b: number) => a + b, 0);
        } else if (round.notes.includes('(back 9)')) {
          return round.golf_courses.hole_pars.slice(9, 18).reduce((a: number, b: number) => a + b, 0);
        }
      }
      // Fallback: assume 9 holes is half the course par
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

  const confirmDelete = () => {
    if (roundToDelete) {
      handleDeleteRound(roundToDelete);
      setRoundToDelete(null);
    }
  };

  const cancelDelete = () => {
    setRoundToDelete(null);
  };

  if (roundsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            {t("profile", "recentRounds")}
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            {t("profile", "recentRounds")}
          </h2>
        </div>
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
      </div>
    );
  }

  // Only show first 5 rounds
  const displayRounds = rounds.slice(0, 5);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            {t("profile", "recentRounds")}
          </h2>
          {rounds.length >= 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/all-rounds')}
              className="text-primary hover:text-primary/80 text-xs gap-1"
            >
              Ver todas
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {displayRounds.map((round, index) => {
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
                  transition={{ delay: index * 0.05 }}
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
                            Ver Scorecard
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
              {t("profile", "deleteRound")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RecentRounds;