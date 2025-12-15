import { MinusCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ScoreInputProps {
  currentScore: number;
  onIncrement: () => void;
  onDecrement: () => void;
  scoreColor: string;
  scoreTerm: string;
}

const ScoreInput = ({ currentScore, onIncrement, onDecrement, scoreColor, scoreTerm }: ScoreInputProps) => {
  return (
    <div className="py-4">
      <div className="flex flex-col items-center">
        <p className="text-sm font-medium text-muted-foreground mb-4">Tu Score</p>
        
        <div className="flex items-center justify-center w-full gap-4">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button 
              variant="outline"
              size="icon"
              onClick={onDecrement}
              disabled={currentScore === 0}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 shadow-lg"
            >
              <MinusCircle className="h-7 w-7 sm:h-8 sm:w-8" />
            </Button>
          </motion.div>
          
          <motion.div 
            key={currentScore}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl sm:text-6xl font-bold min-w-[100px] text-center ${scoreColor}`}
          >
            {currentScore || '-'}
          </motion.div>
          
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button 
              variant="outline"
              size="icon"
              onClick={onIncrement}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 shadow-lg"
            >
              <PlusCircle className="h-7 w-7 sm:h-8 sm:w-8" />
            </Button>
          </motion.div>
        </div>
        
        {scoreTerm && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 px-4 py-1.5 rounded-full text-sm font-semibold ${
              scoreColor.includes('green') 
                ? 'bg-green-500/10 text-green-500' 
                : scoreColor.includes('blue')
                  ? 'bg-blue-500/10 text-blue-500'
                  : scoreColor.includes('red')
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-muted text-muted-foreground'
            }`}
          >
            {scoreTerm}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ScoreInput;