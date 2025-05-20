
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Calendar, Trophy, MapPin, Flag, Plus, Minus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Round } from "./types";
import { useState } from "react";

interface RoundCardProps {
  round: Round;
  onDeleteRound: (roundId: string) => void;
  isDeleting: boolean;
}

const RoundCard = ({ round, onDeleteRound, isDeleting }: RoundCardProps) => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const formattedDate = format(new Date(round.date || round.created_at), 'MMM d, yyyy');
  
  // Calculate total par for a course
  const calculateCoursePar = (holePars: number[] | undefined): number => {
    if (!holePars || holePars.length === 0) return 0;
    return holePars.reduce((sum, par) => sum + par, 0);
  };
  
  const coursePar = round.golf_courses.par || calculateCoursePar(round.golf_courses.hole_pars);
  const scoreDiff = round.score - coursePar;
  
  let scoreStatus;
  let scoreColor;
  let ScoreIcon;
  
  if (scoreDiff < 0) {
    scoreStatus = `${Math.abs(scoreDiff)} ${t("profile", "underPar")}`;
    scoreColor = "text-green-600";
    ScoreIcon = Minus;
  } else if (scoreDiff > 0) {
    scoreStatus = `${scoreDiff} ${t("profile", "overPar")}`;
    scoreColor = "text-red-600";
    ScoreIcon = Plus;
  } else {
    scoreStatus = t("profile", "atPar");
    scoreColor = "text-blue-600";
    ScoreIcon = Check;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteRound(round.id);
    setIsDialogOpen(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-muted/10 flex flex-col"
    >
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
            <span className="text-sm font-medium">{round.golf_courses.holes} {t("profile", "holes")}</span>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-sm text-muted-foreground mb-1">{t("profile", "totalScore")}</div>
            <div className="text-2xl font-bold text-primary">
              {round.score}
            </div>
            
            <div className={`flex items-center gap-1 text-sm font-medium ${scoreColor}`}>
              <ScoreIcon className="h-3 w-3" />
              <span>{scoreStatus}</span>
            </div>
          </div>
        </div>
        
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-3 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full cursor-pointer"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  {t("profile", "deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t("profile", "deleteRound")}
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("profile", "deleteRound")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("profile", "deleteRoundConfirm")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                {t("common", "cancel")}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                {t("profile", "deleteRound")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};

export default RoundCard;
