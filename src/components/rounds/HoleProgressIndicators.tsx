import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface HoleProgressIndicatorsProps {
  numberOfHoles: number;
  scores: number[];
  currentHoleIndex: number;
  holeOffset: number;
  onHoleSelect: (index: number) => void;
}

const HoleProgressIndicators = ({ 
  numberOfHoles, 
  scores, 
  currentHoleIndex, 
  holeOffset, 
  onHoleSelect 
}: HoleProgressIndicatorsProps) => {
  // Determine grid columns based on number of holes
  const gridCols = numberOfHoles <= 9 ? 'grid-cols-9' : 'grid-cols-9';
  
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground text-center">Toca un hoyo para editarlo</p>
      <div className={`grid ${gridCols} gap-1.5`}>
        {Array.from({ length: numberOfHoles }).map((_, index) => {
          const isCompleted = scores[index] > 0;
          const isCurrent = index === currentHoleIndex;
          const displayHoleNumber = index + 1 + holeOffset;
          
          return (
            <motion.button
              key={index}
              onClick={() => onHoleSelect(index)}
              whileTap={{ scale: 0.9 }}
              className={`
                relative aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all
                ${isCurrent 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110 z-10' 
                  : isCompleted 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }
              `}
            >
              {isCompleted && !isCurrent ? (
                <Check className="h-3 w-3" />
              ) : (
                displayHoleNumber
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-primary/20" />
          <span className="text-xs text-muted-foreground">Completado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-muted/50" />
          <span className="text-xs text-muted-foreground">Pendiente</span>
        </div>
      </div>
    </div>
  );
};

export default HoleProgressIndicators;