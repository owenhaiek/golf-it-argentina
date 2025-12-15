import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  const isLastHole = currentHoleIndex >= numberOfHoles - 1;
  
  return (
    <div className="flex gap-3">
      <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentHoleIndex === 0}
          className="w-full h-12 rounded-xl text-sm font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
      </motion.div>
      
      <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
        <Button
          onClick={onNext}
          disabled={!currentScore}
          className={`w-full h-12 rounded-xl text-sm font-medium ${
            isLastHole 
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
              : ''
          }`}
        >
          {isLastHole ? (
            <>
              Completar
              <Check className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default HoleNavigation;