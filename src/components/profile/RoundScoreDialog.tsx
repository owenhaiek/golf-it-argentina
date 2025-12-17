import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Flag, Plus, Minus, Check, X } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Round {
  id: string;
  user_id: string;
  course_id: string;
  date: string;
  score: number;
  hole_scores?: number[];
  notes?: string;
  created_at: string;
  golf_courses?: {
    name: string;
    par?: number;
    image_url?: string;
    hole_pars?: number[];
  };
}

interface RoundScoreDialogProps {
  round: Round | null;
  isOpen: boolean;
  onClose: () => void;
}

const RoundScoreDialog = ({ round, isOpen, onClose }: RoundScoreDialogProps) => {
  const [selectedHole, setSelectedHole] = useState(0);

  if (!round) return null;

  // Helper function to calculate the correct par for a round
  const calculateRoundPar = (round: Round) => {
    const fullCoursePar = round.golf_courses?.par || 72;
    
    if (round.notes && round.notes.includes('9 holes played')) {
      if (round.golf_courses?.hole_pars && round.golf_courses.hole_pars.length >= 18) {
        if (round.notes.includes('(front 9)')) {
          return round.golf_courses.hole_pars.slice(0, 9).reduce((a, b) => a + b, 0);
        } else if (round.notes.includes('(back 9)')) {
          return round.golf_courses.hole_pars.slice(9, 18).reduce((a, b) => a + b, 0);
        }
      }
      return Math.round(fullCoursePar / 2);
    }
    
    return fullCoursePar;
  };

  const getHoleData = () => {
    if (!round.golf_courses?.hole_pars) {
      return Array(18).fill(4);
    }

    if (round.notes && round.notes.includes('9 holes played')) {
      if (round.notes.includes('(front 9)')) {
        return round.golf_courses.hole_pars.slice(0, 9);
      } else if (round.notes.includes('(back 9)')) {
        return round.golf_courses.hole_pars.slice(9, 18);
      }
      return round.golf_courses.hole_pars.slice(0, 9);
    }

    return round.golf_courses.hole_pars;
  };

  const holePars = getHoleData();
  const numberOfHoles = holePars.length;
  
  const getHoleScores = () => {
    if (round.hole_scores && round.hole_scores.length > 0) {
      if (round.notes && round.notes.includes('9 holes played')) {
        if (round.notes.includes('(back 9)') && round.hole_scores.length >= 18) {
          return round.hole_scores.slice(9, 18);
        } else {
          return round.hole_scores.slice(0, 9);
        }
      }
      return round.hole_scores.slice(0, numberOfHoles);
    }
    return null;
  };

  const holeScores = getHoleScores();
  const coursePar = calculateRoundPar(round);
  const scoreDiff = round.score - coursePar;

  const getScoreStatus = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= -2) return { term: 'Eagle', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: Minus };
    if (diff === -1) return { term: 'Birdie', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: Minus };
    if (diff === 0) return { term: 'Par', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: Check };
    if (diff === 1) return { term: 'Bogey', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: Plus };
    return { term: 'Double+', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: Plus };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden bg-zinc-900/95 backdrop-blur-xl border-zinc-800 p-0">
        {/* Header with Image */}
        <div className="relative">
          {round.golf_courses?.image_url && (
            <div className="h-32 relative">
              <img 
                src={round.golf_courses.image_url} 
                alt={round.golf_courses.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-3 top-3 h-8 w-8 p-0 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className={`absolute bottom-0 left-0 right-0 p-4 ${!round.golf_courses?.image_url ? 'relative pt-12' : ''}`}>
            <h3 className="font-bold text-lg text-white">
              {round.golf_courses?.name || "Unknown Course"}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(round.date), "d MMM, yyyy")}
              </span>
              <span>{numberOfHoles} hoyos</span>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-3 gap-3">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800/80 rounded-xl p-3 text-center"
            >
              <div className="text-2xl font-bold text-white">{round.score}</div>
              <div className="text-xs text-zinc-500">Total</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-zinc-800/80 rounded-xl p-3 text-center"
            >
              <div className="text-2xl font-bold text-zinc-400">{coursePar}</div>
              <div className="text-xs text-zinc-500">Par</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-xl p-3 text-center ${
                scoreDiff > 0 ? 'bg-red-500/20' : scoreDiff < 0 ? 'bg-green-500/20' : 'bg-blue-500/20'
              }`}
            >
              <div className={`text-2xl font-bold ${
                scoreDiff > 0 ? 'text-red-400' : scoreDiff < 0 ? 'text-green-400' : 'text-blue-400'
              }`}>
                {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff === 0 ? 'E' : scoreDiff}
              </div>
              <div className="text-xs text-zinc-500">vs Par</div>
            </motion.div>
          </div>
        </div>

        {/* Hole-by-Hole Scores */}
        <div className="px-4 pb-4 overflow-y-auto max-h-[45vh]">
          <h4 className="font-semibold text-sm text-zinc-400 mb-3 flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Scorecard
          </h4>
          
          {holeScores ? (
            <div className="space-y-2">
              {holeScores.map((score, index) => {
                const par = holePars[index];
                const status = getScoreStatus(score, par);
                const diff = score - par;
                
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-zinc-700/80 flex items-center justify-center">
                        <span className="text-sm font-bold text-zinc-300">{index + 1}</span>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500">Par {par}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-lg ${status.bgColor}`}>
                        <span className={`text-sm font-bold ${status.color}`}>{score}</span>
                      </div>
                      <div className={`flex items-center gap-1 min-w-[70px] justify-end ${status.color}`}>
                        {diff !== 0 && <status.icon className="h-3 w-3" />}
                        <span className="text-xs font-medium">{status.term}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-zinc-800/40 rounded-xl">
              <div className="h-12 w-12 rounded-xl bg-zinc-700/50 flex items-center justify-center mx-auto mb-3">
                <Flag className="h-6 w-6 text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-400 font-medium mb-1">Scores por hoyo no disponibles</p>
              <p className="text-xs text-zinc-500">
                Solo el score total de <strong className="text-zinc-300">{round.score}</strong> está disponible
              </p>
            </div>
          )}

          {round.notes && (
            <div className="mt-4 p-3 bg-zinc-800/60 rounded-xl">
              <span className="text-xs text-zinc-500">Notas:</span>
              <p className="text-sm text-zinc-300 mt-1">{round.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoundScoreDialog;