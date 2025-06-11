
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

  // Get the appropriate hole image based on par
  const getHoleImage = (par: number): string => {
    switch (par) {
      case 3:
        return '/lovable-uploads/4e7e6b36-dca0-45f9-a403-d638850c65de.png';
      case 4:
        return '/lovable-uploads/733e8b06-d1ae-4521-8b31-d2525ba9bd35.png';
      case 5:
        return '/lovable-uploads/b49a1695-b905-4fe8-a00e-25b798e36009.png';
      default:
        return '/lovable-uploads/733e8b06-d1ae-4521-8b31-d2525ba9bd35.png'; // Default to par 4
    }
  };

  // Enhanced hole visualization with custom images and animations
  const renderHoleVisualization = () => {
    const holeImage = getHoleImage(currentPar);
    
    return (
      <div className="relative w-full h-48 sm:h-56 my-4 rounded-xl overflow-hidden bg-gradient-to-b from-sky-200 to-green-200 dark:from-sky-900 dark:to-green-900">
        {/* Animated hole image */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <img 
            src={holeImage}
            alt={`Par ${currentPar} hole layout`}
            className="w-full h-full object-contain transition-all duration-700 ease-in-out transform hover:scale-105"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              animation: 'fade-in 0.5s ease-out'
            }}
          />
        </div>
        
        {/* Hole information overlay */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Hole {currentHoleIndex + 1}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Par {currentPar}
          </div>
        </div>

        {/* Score status overlay */}
        {currentScore > 0 && (
          <div className={`absolute top-3 right-3 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm ${
            getScoreColor(currentScore, currentPar).includes('green') 
              ? 'bg-green-100/90 dark:bg-green-900/90' 
              : getScoreColor(currentScore, currentPar).includes('blue')
                ? 'bg-blue-100/90 dark:bg-blue-900/90'
                : 'bg-red-100/90 dark:bg-red-900/90'
          }`}>
            <div className={`text-sm font-semibold ${scoreColor}`}>
              {scoreTerm}
            </div>
            <div className={`text-xs ${scoreColor}`}>
              {currentScore - currentPar > 0 ? `+${currentScore - currentPar}` : currentScore - currentPar}
            </div>
          </div>
        )}

        {/* Animated golf ball indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-bounce" 
               style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    );
  };

  // Progress bar
  const progressPercentage = ((currentHoleIndex + 1) / numberOfHoles) * 100;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl text-center">{selectedCourseData?.name}</CardTitle>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }} 
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Score Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-secondary/20 p-3 sm:p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-muted-foreground" />
              <h3 className="text-xs sm:text-sm text-muted-foreground">Score</h3>
            </div>
            <div className="text-xl sm:text-3xl font-bold">{currentTotal}</div>
          </div>
          
          <div className="bg-secondary/20 p-3 sm:p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-1">
              <Flag className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-muted-foreground" />
              <h3 className="text-xs sm:text-sm text-muted-foreground">Par</h3>
            </div>
            <div className="text-xl sm:text-3xl font-bold">{totalPar}</div>
          </div>
          
          <div className={`p-3 sm:p-4 rounded-lg text-center ${
            vsParScore <= 0 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-muted-foreground" />
              <h3 className="text-xs sm:text-sm text-muted-foreground">vs Par</h3>
            </div>
            <div className={`text-xl sm:text-3xl font-bold ${
              vsParScore <= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {vsParScore <= 0 ? vsParScore : `+${vsParScore}`}
            </div>
          </div>
        </div>

        {/* Enhanced Hole Interface with Custom Images */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Beautiful hole visualization */}
          {renderHoleVisualization()}
          
          {/* Score input section */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col items-center">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Your Score</h3>
              
              <div className="flex items-center justify-center w-full">
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={decrementScore}
                  disabled={currentScore === 0}
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full"
                >
                  <MinusCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                </Button>
                
                <div className={`text-4xl sm:text-6xl font-bold mx-6 sm:mx-8 min-w-[80px] sm:min-w-[120px] text-center ${scoreColor}`}>
                  {currentScore || '-'}
                </div>
                
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={incrementScore}
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full"
                >
                  <PlusCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                </Button>
              </div>
              
              {scoreTerm && (
                <div className={`mt-2 font-medium text-base sm:text-lg ${scoreColor}`}>
                  {scoreTerm}
                </div>
              )}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6 sm:mt-8">
              <Button
                variant="outline"
                onClick={goToPreviousHole}
                disabled={currentHoleIndex === 0}
                className="flex-1 h-12 text-sm sm:text-base"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <Button
                onClick={goToNextHole}
                disabled={!currentScore}
                className="flex-1 h-12 text-sm sm:text-base"
              >
                {currentHoleIndex < numberOfHoles - 1 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Complete
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Hole progress indicators */}
        <div className="grid grid-cols-9 gap-1 sm:gap-2">
          {Array.from({ length: numberOfHoles }).map((_, index) => {
            const isCompleted = scores[index] > 0;
            const isCurrent = index === currentHoleIndex;
            
            return (
              <button
                key={index}
                onClick={() => setCurrentHoleIndex(index)}
                className={`
                  h-8 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all
                  ${isCurrent 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 scale-110' 
                    : isCompleted 
                      ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                      : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
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
