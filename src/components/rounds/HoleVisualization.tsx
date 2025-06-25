
import { Flag } from "lucide-react";

interface HoleVisualizationProps {
  currentHoleIndex: number;
  holeOffset: number;
  currentPar: number;
  currentScore: number;
  selectedSide?: "front" | "back";
}

const HoleVisualization = ({ 
  currentHoleIndex, 
  holeOffset, 
  currentPar, 
  currentScore, 
  selectedSide 
}: HoleVisualizationProps) => {
  const getHoleImage = (par: number): string => {
    switch (par) {
      case 3:
        return '/lovable-uploads/4e7e6b36-dca0-45f9-a403-d638850c65de.png';
      case 4:
        return '/lovable-uploads/733e8b06-d1ae-4521-8b31-d2525ba9bd35.png';
      case 5:
        return '/lovable-uploads/b49a1695-b905-4fe8-a00e-25b798e36009.png';
      default:
        return '/lovable-uploads/733e8b06-d1ae-4521-8b31-d2525ba9bd35.png';
    }
  };

  const getScoreColor = (score: number, par: number): string => {
    if (score === 0) return 'text-muted-foreground';
    
    const diff = score - par;
    
    if (diff < 0) return 'text-green-500 dark:text-green-400';
    if (diff === 0) return 'text-blue-500 dark:text-blue-400';
    return 'text-red-500 dark:text-red-400';
  };

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

  const holeImage = getHoleImage(currentPar);
  const scoreColor = getScoreColor(currentScore, currentPar);
  const scoreTerm = getScoreTerm(currentScore, currentPar);

  return (
    <div className="relative w-full h-64 sm:h-72 my-4 rounded-xl overflow-hidden bg-white border border-gray-200 dark:bg-gray-50 dark:border-gray-300">
      {/* Hole image */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <img 
          src={holeImage}
          alt={`Par ${currentPar} hole layout`}
          className="w-full h-full object-contain transition-all duration-700 ease-in-out transform hover:scale-105"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
            animation: 'fade-in 0.5s ease-out'
          }}
        />
      </div>
      
      {/* Hole information overlay */}
      <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">
            Hole {currentHoleIndex + 1 + holeOffset}
            {selectedSide && ` (${selectedSide === 'front' ? 'Front' : 'Back'} 9)`}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Par {currentPar}
        </div>
      </div>

      {/* Score status overlay */}
      {currentScore > 0 && (
        <div className={`absolute top-3 right-3 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm border ${
          scoreColor.includes('green') 
            ? 'bg-green-100/95 dark:bg-green-900/95 border-green-200 dark:border-green-700' 
            : scoreColor.includes('blue')
              ? 'bg-blue-100/95 dark:bg-blue-900/95 border-blue-200 dark:border-blue-700'
              : 'bg-red-100/95 dark:bg-red-900/95 border-red-200 dark:border-red-700'
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
        <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-bounce border border-gray-300" 
             style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  );
};

export default HoleVisualization;
