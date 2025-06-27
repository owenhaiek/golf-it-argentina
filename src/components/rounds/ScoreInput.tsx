
import { MinusCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScoreInputProps {
  currentScore: number;
  onIncrement: () => void;
  onDecrement: () => void;
  scoreColor: string;
  scoreTerm: string;
}

const ScoreInput = ({ currentScore, onIncrement, onDecrement, scoreColor, scoreTerm }: ScoreInputProps) => {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col items-center">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Your Score</h3>
        
        <div className="flex items-center justify-center w-full">
          <Button 
            variant="ghost"
            size="icon"
            onClick={onDecrement}
            disabled={currentScore === 0}
            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full"
          >
            <MinusCircle className="h-8 w-8 sm:h-10 sm:w-10" />
          </Button>
          
          <div className={`text-4xl sm:text-6xl font-bold mx-6 sm:mx-8 min-w-[80px] sm:min-w-[120px] text-center ${scoreColor}`}>
            {currentScore || '-'}
          </div>
          
          <Button 
            variant="ghost"
            size="icon"
            onClick={onIncrement}
            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full"
          >
            <PlusCircle className="h-8 w-8 sm:h-10 sm:w-10" />
          </Button>
        </div>
        
        {scoreTerm && (
          <div className={`mt-2 font-medium text-base sm:text-lg ${scoreColor}`}>
            {scoreTerm}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreInput;
