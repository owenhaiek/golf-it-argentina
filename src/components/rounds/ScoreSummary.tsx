
import { Trophy, Flag, Target } from "lucide-react";

interface ScoreSummaryProps {
  currentTotal: number;
  totalPar: number;
  vsParScore: number;
}

const ScoreSummary = ({ currentTotal, totalPar, vsParScore }: ScoreSummaryProps) => {
  return (
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
  );
};

export default ScoreSummary;
