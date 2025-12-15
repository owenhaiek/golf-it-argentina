import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import ScoreSummary from "./ScoreSummary";
import HoleVisualization from "./HoleVisualization";
import ScoreInput from "./ScoreInput";
import HoleNavigation from "./HoleNavigation";
import HoleProgressIndicators from "./HoleProgressIndicators";
import { motion } from "framer-motion";

interface Course {
  id: string;
  name: string;
  holes: number;
  hole_pars: number[];
}

interface ScoreCardProps {
  selectedCourseData: Course | undefined;
  scores: number[];
  onScoreChange: (index: number, value: number) => void;
  selectedSide?: "front" | "back";
}

const ScoreCard = ({ selectedCourseData, scores, onScoreChange, selectedSide }: ScoreCardProps) => {
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const { toast } = useToast();
  
  const numberOfHoles = selectedCourseData?.holes || 18;
  
  // Calculate hole offset for front/back 9
  const holeOffset = selectedSide === "back" ? 9 : 0;
  
  // Get the correct par values based on selected side and handle 9-hole courses
  const getHolePars = () => {
    if (!selectedCourseData?.hole_pars) return [];
    
    const originalHolePars = selectedCourseData.hole_pars;
    
    // If this is a 9-hole course but we're playing 18 holes
    if (originalHolePars.length === 9 && numberOfHoles === 18) {
      const duplicatedPars = [...originalHolePars, ...originalHolePars];
      
      if (selectedSide === "back") {
        return duplicatedPars.slice(9, 18);
      } else if (selectedSide === "front") {
        return duplicatedPars.slice(0, 9);
      }
      return duplicatedPars.slice(0, numberOfHoles);
    }
    
    // Normal handling for courses with full hole par data
    if (selectedSide === "back" && originalHolePars.length >= 18) {
      return originalHolePars.slice(9, 18);
    } else if (selectedSide === "front" && originalHolePars.length >= 9) {
      return originalHolePars.slice(0, 9);
    }
    
    return originalHolePars.slice(0, numberOfHoles);
  };

  const holePars = getHolePars();
  const totalPar = holePars.reduce((a, b) => a + (b || 0), 0);
  const currentTotal = scores.slice(0, numberOfHoles).reduce((a, b) => a + b, 0);
  const vsParScore = currentTotal - totalPar;

  const incrementScore = () => {
    onScoreChange(currentHoleIndex, scores[currentHoleIndex] + 1);
  };

  const decrementScore = () => {
    if (scores[currentHoleIndex] > 0) {
      onScoreChange(currentHoleIndex, scores[currentHoleIndex] - 1);
    }
  };

  const goToNextHole = () => {
    if (currentHoleIndex < numberOfHoles - 1) {
      setCurrentHoleIndex(currentHoleIndex + 1);
    } else {
      toast({
        title: "¡Ronda Completa!",
        description: "Has ingresado todos los scores.",
      });
    }
  };

  const goToPreviousHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1);
    }
  };

  // Calculate score terms for display
  const getScoreTerm = (score: number, par: number): string => {
    if (score === 0) return '';
    
    const diff = score - par;
    
    if (diff === -2) return 'Eagle';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double';
    if (diff > 2) return 'Triple+';
    return '';
  };

  const getScoreColor = (score: number, par: number): string => {
    if (score === 0) return 'text-muted-foreground';
    
    const diff = score - par;
    
    if (diff < 0) return 'text-green-500 dark:text-green-400';
    if (diff === 0) return 'text-blue-500 dark:text-blue-400';
    return 'text-red-500 dark:text-red-400';
  };

  const currentPar = holePars[currentHoleIndex] || 0;
  const currentScore = scores[currentHoleIndex];
  const scoreTerm = getScoreTerm(currentScore, currentPar);
  const scoreColor = getScoreColor(currentScore, currentPar);

  // Progress bar
  const progressPercentage = ((currentHoleIndex + 1) / numberOfHoles) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
    >
      {/* Header with progress */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            Hoyo {currentHoleIndex + 1 + holeOffset} de {numberOfHoles + holeOffset}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main scoring area */}
      <div className="p-4 space-y-4">
        <HoleVisualization
          currentHoleIndex={currentHoleIndex}
          holeOffset={holeOffset}
          currentPar={currentPar}
          currentScore={currentScore}
          selectedSide={selectedSide}
        />
        
        <ScoreInput
          currentScore={currentScore}
          onIncrement={incrementScore}
          onDecrement={decrementScore}
          scoreColor={scoreColor}
          scoreTerm={scoreTerm}
        />
        
        <HoleNavigation
          currentHoleIndex={currentHoleIndex}
          numberOfHoles={numberOfHoles}
          currentScore={currentScore}
          onPrevious={goToPreviousHole}
          onNext={goToNextHole}
        />
      </div>

      {/* Hole indicators */}
      <div className="p-4 pt-0">
        <HoleProgressIndicators
          numberOfHoles={numberOfHoles}
          scores={scores}
          currentHoleIndex={currentHoleIndex}
          holeOffset={holeOffset}
          onHoleSelect={setCurrentHoleIndex}
        />
      </div>
    </motion.div>
  );
};

export default ScoreCard;