import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trophy, Calendar, Loader2, Eye, Plus, Minus, Check, Flag, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RoundScoreDialog from "./RoundScoreDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface Round {
  id: string;
  user_id: string;
  course_id: string;
  date: string;
  score: number;
  notes?: string;
  created_at: string;
  hole_scores?: number[];
  golf_courses?: {
    name: string;
    par?: number;
    image_url?: string;
    hole_pars?: number[];
  };
}

interface UserRecentRoundsProps {
  rounds: Round[];
  roundsLoading: boolean;
}

const UserRecentRounds = ({ rounds, roundsLoading }: UserRecentRoundsProps) => {
  const { t } = useLanguage();
  const [showAllRounds, setShowAllRounds] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(5);
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);

  // Get the user ID from the first round to fetch all rounds for this user
  const userId = rounds?.[0]?.user_id;

  // Query to fetch all rounds when "View All Rounds" is clicked
  const {
    data: allRounds,
    isLoading: allRoundsLoading,
    refetch: fetchAllRounds
  } = useQuery({
    queryKey: ['allUserRounds', userId],
    queryFn: async () => {
      if (!userId) return [];
      
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("All rounds fetch error:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: false // Only fetch when explicitly requested
  });

  const handleViewAllRounds = async () => {
    if (!showAllRounds) {
      await fetchAllRounds();
      setShowAllRounds(true);
    } else {
      setDisplayLimit(prev => prev + 10); // Load 10 more rounds
    }
  };

  const handleViewRoundScore = (round: Round) => {
    setSelectedRound(round);
    setIsScoreDialogOpen(true);
  };

  // Helper function to calculate the correct par for a round
  const calculateRoundPar = (round: Round) => {
    const fullCoursePar = round.golf_courses?.par || 72;
    
    // Check if this is a 9-hole round from the notes
    if (round.notes && round.notes.includes('9 holes played')) {
      if (round.golf_courses?.hole_pars && round.golf_courses.hole_pars.length >= 18) {
        // Calculate front 9 or back 9 par based on notes
        if (round.notes.includes('(front 9)')) {
          return round.golf_courses.hole_pars.slice(0, 9).reduce((a, b) => a + b, 0);
        } else if (round.notes.includes('(back 9)')) {
          return round.golf_courses.hole_pars.slice(9, 18).reduce((a, b) => a + b, 0);
        }
      }
      // Fallback: assume 9 holes is half the course par
      return Math.round(fullCoursePar / 2);
    }
    
    return fullCoursePar;
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
          <p className="text-muted-foreground">{t("profile", "noRoundsRecorded")}</p>
        </motion.div>
      </div>
    );
  }

  // Determine which rounds to display
  const roundsToShow = showAllRounds 
    ? (allRounds?.slice(0, displayLimit) || rounds)
    : rounds;

  const hasMoreRounds = showAllRounds 
    ? (allRounds?.length || 0) > displayLimit
    : rounds.length >= 5;

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
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {roundsToShow.map((round, index) => {
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

              // Extract holes info from notes
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
                  {/* Course Image Background */}
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
                      {/* Score Circle */}
                      <div className="flex-shrink-0">
                        <div className={`h-16 w-16 rounded-2xl ${scoreBgColor} flex flex-col items-center justify-center`}>
                          <span className="text-2xl font-bold text-foreground">{round.score}</span>
                          <div className={`flex items-center text-xs font-medium ${scoreColor}`}>
                            <ScoreIcon className="h-3 w-3" />
                            <span>{scoreLabel}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Course Info */}
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
                        
                        {/* Action Buttons */}
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
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {hasMoreRounds && (
          <div className="text-center pt-2">
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleViewAllRounds}
              disabled={allRoundsLoading}
              className="text-primary hover:text-primary/80"
            >
              {allRoundsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  {showAllRounds ? "Cargar más" : "Ver todas las rondas"}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <RoundScoreDialog
        round={selectedRound}
        isOpen={isScoreDialogOpen}
        onClose={() => setIsScoreDialogOpen(false)}
      />
    </>
  );
};

export default UserRecentRounds;