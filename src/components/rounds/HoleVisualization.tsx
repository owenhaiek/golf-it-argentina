import { Flag } from "lucide-react";
import { motion } from "framer-motion";

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
    
    if (diff < 0) return 'text-green-500';
    if (diff === 0) return 'text-blue-500';
    return 'text-red-500';
  };

  const getScoreTerm = (score: number, par: number): string => {
    if (score === 0) return '';
    
    const diff = score - par;
    
    if (diff === -2) return 'Eagle';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double';
    if (diff > 2) return 'Triple+';
    return '';
  };

  const holeImage = getHoleImage(currentPar);
  const scoreColor = getScoreColor(currentScore, currentPar);
  const scoreTerm = getScoreTerm(currentScore, currentPar);

  return (
    <motion.div 
      key={currentHoleIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20"
    >
      {/* Hole image */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <img 
          src={holeImage}
          alt={`Par ${currentPar} hole layout`}
          className="w-full h-full object-contain"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
          }}
        />
      </div>
      
      {/* Hole info badge - top left */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="bg-background/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Flag className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">
                Hoyo {currentHoleIndex + 1 + holeOffset}
              </p>
              <p className="text-xs text-muted-foreground">
                Par {currentPar}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Score badge - top right */}
      {currentScore > 0 && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute top-3 right-3 px-3 py-2 rounded-xl shadow-lg backdrop-blur-sm border ${
            scoreColor.includes('green') 
              ? 'bg-green-500/20 border-green-500/30' 
              : scoreColor.includes('blue')
                ? 'bg-blue-500/20 border-blue-500/30'
                : 'bg-red-500/20 border-red-500/30'
          }`}
        >
          <p className={`text-sm font-bold ${scoreColor}`}>
            {scoreTerm}
          </p>
          <p className={`text-xs ${scoreColor}`}>
            {currentScore - currentPar > 0 ? `+${currentScore - currentPar}` : currentScore - currentPar}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HoleVisualization;