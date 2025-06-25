
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
  return (
    <div className="grid grid-cols-9 gap-1 sm:gap-2">
      {Array.from({ length: numberOfHoles }).map((_, index) => {
        const isCompleted = scores[index] > 0;
        const isCurrent = index === currentHoleIndex;
        const displayHoleNumber = index + 1 + holeOffset;
        
        return (
          <button
            key={index}
            onClick={() => onHoleSelect(index)}
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
            {displayHoleNumber}
          </button>
        );
      })}
    </div>
  );
};

export default HoleProgressIndicators;
