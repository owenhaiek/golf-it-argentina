
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HoleNavigationProps {
  currentHoleIndex: number;
  numberOfHoles: number;
  currentScore: number;
  onPrevious: () => void;
  onNext: () => void;
}

const HoleNavigation = ({ 
  currentHoleIndex, 
  numberOfHoles, 
  currentScore, 
  onPrevious, 
  onNext 
}: HoleNavigationProps) => {
  return (
    <div className="flex gap-3 mt-6 sm:mt-8">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentHoleIndex === 0}
        className="flex-1 h-12 text-sm sm:text-base"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>
      
      <Button
        onClick={onNext}
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
  );
};

export default HoleNavigation;
