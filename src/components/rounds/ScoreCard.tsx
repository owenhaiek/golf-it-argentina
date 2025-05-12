
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MinusCircle, PlusCircle, Trophy, Flag, Target, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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
}

const ScoreCard = ({ selectedCourseData, scores, onScoreChange }: ScoreCardProps) => {
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const { toast } = useToast();
  
  const numberOfHoles = selectedCourseData?.holes || 18;
  const totalPar = selectedCourseData?.hole_pars
    ?.slice(0, numberOfHoles)
    .reduce((a, b) => a + (b || 0), 0) || 0;
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

  // Get color based on score relative to par
  const getScoreColor = (score: number, par: number): string => {
    if (score === 0) return 'text-muted-foreground';
    
    const diff = score - par;
    
    if (diff < 0) return 'text-green-500 dark:text-green-400';
    if (diff === 0) return 'text-blue-500 dark:text-blue-400';
    return 'text-red-500 dark:text-red-400';
  };

  const currentPar = selectedCourseData?.hole_pars?.[currentHoleIndex] || 0;
  const currentScore = scores[currentHoleIndex];
  const scoreTerm = getScoreTerm(currentScore, currentPar);
  const scoreColor = getScoreColor(currentScore, currentPar);

  // Generate a simple visualization of the hole
  const renderHoleMap = () => {
    return (
      <div className="relative w-full h-28 my-4 bg-green-100 dark:bg-green-900/30 rounded-lg overflow-hidden">
        {/* Tee box */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full" />
        
        {/* Fairway */}
        <div className="absolute left-12 top-1/2 -translate-y-1/2 h-3 bg-green-300 dark:bg-green-700"
             style={{ width: `calc(100% - 88px)` }} />
        
        {/* Hole/Flag */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 bg-green-400 dark:bg-green-600 rounded-full flex items-center justify-center">
          <div className="w-1 h-10 bg-black relative">
            <div className="absolute top-0 right-0 w-4 h-3 bg-red-500" />
          </div>
        </div>

        {/* Par indicator */}
        <div className="absolute bottom-2 left-2 text-xs font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
          Par {currentPar}
        </div>
      </div>
    );
  };

  // Progress bar
  const progressPercentage = ((currentHoleIndex + 1) / numberOfHoles) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Card - {selectedCourseData?.name}</CardTitle>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }} 
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/20 p-4 rounded-lg text-center transition-all hover:shadow-md">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="h-5 w-5 mr-2 text-muted-foreground" />
              <h3 className="text-sm text-muted-foreground">Your Score</h3>
            </div>
            <div className="text-3xl font-bold">{currentTotal}</div>
          </div>
          
          <div className="bg-secondary/20 p-4 rounded-lg text-center transition-all hover:shadow-md">
            <div className="flex items-center justify-center mb-1">
              <Flag className="h-5 w-5 mr-2 text-muted-foreground" />
              <h3 className="text-sm text-muted-foreground">Course Par</h3>
            </div>
            <div className="text-3xl font-bold">{totalPar}</div>
          </div>
          
          <div className={`p-4 rounded-lg text-center transition-all hover:shadow-md ${
            vsParScore <= 0 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            <div className="flex items-center justify-center mb-1">
              <Target className="h-5 w-5 mr-2 text-muted-foreground" />
              <h3 className="text-sm text-muted-foreground">vs Par</h3>
            </div>
            <div className={`text-3xl font-bold ${
              vsParScore <= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {vsParScore <= 0 ? vsParScore : `+${vsParScore}`}
            </div>
          </div>
        </div>

        {/* Step-by-step hole interface */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-center mb-4 flex items-center justify-center">
            <h2>Hole {currentHoleIndex + 1}</h2>
            <span className="ml-2 px-3 py-1 text-sm rounded-full bg-primary/10 text-primary">
              Par {currentPar}
            </span>
          </div>
          
          {/* Hole visualization */}
          {renderHoleMap()}
          
          {/* Score input */}
          <div className="flex flex-col items-center mt-6">
            <h3 className="text-lg font-semibold mb-2">Your Score</h3>
            
            <div className="flex items-center justify-center w-full max-w-xs">
              <button 
                type="button"
                onClick={decrementScore}
                className="text-muted-foreground hover:text-primary transition-colors p-2"
                aria-label="Decrease score"
              >
                <MinusCircle className="h-8 w-8" />
              </button>
              
              <div className={`text-5xl font-bold mx-8 ${scoreColor}`}>
                {currentScore || '-'}
              </div>
              
              <button 
                type="button"
                onClick={incrementScore}
                className="text-muted-foreground hover:text-primary transition-colors p-2"
                aria-label="Increase score"
              >
                <PlusCircle className="h-8 w-8" />
              </button>
            </div>
            
            {scoreTerm && (
              <div className={`mt-2 font-medium text-lg ${scoreColor}`}>
                {scoreTerm}
              </div>
            )}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={goToPreviousHole}
              disabled={currentHoleIndex === 0}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Hole
            </Button>
            
            <Button
              onClick={goToNextHole}
              className="flex items-center"
              disabled={!currentScore}
            >
              {currentHoleIndex < numberOfHoles - 1 ? (
                <>
                  Next Hole
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Complete Round
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Hole progress indicators */}
        <div className="grid grid-cols-9 gap-1 mt-4">
          {Array.from({ length: numberOfHoles }).map((_, index) => {
            const isCompleted = scores[index] > 0;
            const isCurrent = index === currentHoleIndex;
            
            return (
              <button
                key={index}
                onClick={() => setCurrentHoleIndex(index)}
                className={`
                  h-8 rounded-full flex items-center justify-center text-xs font-medium
                  ${isCurrent 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                    : isCompleted 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary/40 text-muted-foreground'
                  }
                `}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
