
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import ScoreSummary from "./ScoreSummary";
import HoleVisualization from "./HoleVisualization";
import ScoreInput from "./ScoreInput";
import HoleNavigation from "./HoleNavigation";
import HoleProgressIndicators from "./HoleProgressIndicators";

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
  
  // Get the correct par values based on selected side
  const getHolePars = () => {
    if (!selectedCourseData?.hole_pars) return [];
    if (selectedSide === "back" && selectedCourseData.hole_pars.length >= 18) {
      return selectedCourseData.hole_pars.slice(9, 18);
    } else if (selectedSide === "front" && selectedCourseData.hole_pars.length >= 9) {
      return selectedCourseData.hole_pars.slice(0, 9);
    }
    return selectedCourseData.hole_pars.slice(0, numberOfHoles);
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
        title: "Round Complete!",
        description: "You've entered scores for all holes.",
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
    if (diff === 2) return 'Double Bogey';
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
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl text-center">
          {selectedCourseData?.name}
          {selectedSide && (
            <div className="text-sm text-muted-foreground font-normal mt-1">
              {selectedSide === 'front' ? 'Front 9 (Holes 1-9)' : 'Back 9 (Holes 10-18)'}
            </div>
          )}
        </CardTitle>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }} 
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <ScoreSummary
          currentTotal={currentTotal}
          totalPar={totalPar}
          vsParScore={vsParScore}
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
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

        <HoleProgressIndicators
          numberOfHoles={numberOfHoles}
          scores={scores}
          currentHoleIndex={currentHoleIndex}
          holeOffset={holeOffset}
          onHoleSelect={setCurrentHoleIndex}
        />
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
