
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { MinusCircle, PlusCircle, Trophy, Flag, Target } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [activeHole, setActiveHole] = useState<number | null>(null);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    const numberOfHoles = selectedCourseData?.holes || 18;
    
    if (event.key === 'Enter' || event.key === 'ArrowRight') {
      if (currentIndex < numberOfHoles - 1) {
        const nextInput = document.querySelector(`input[data-index="${currentIndex + 1}"]`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    } else if (event.key === 'ArrowLeft') {
      if (currentIndex > 0) {
        const prevInput = document.querySelector(`input[data-index="${currentIndex - 1}"]`) as HTMLInputElement;
        if (prevInput) prevInput.focus();
      }
    }
  };

  const incrementScore = (index: number) => {
    onScoreChange(index, scores[index] + 1);
  };

  const decrementScore = (index: number) => {
    if (scores[index] > 0) {
      onScoreChange(index, scores[index] - 1);
    }
  };

  const numberOfHoles = selectedCourseData?.holes || 18;
  const totalPar = selectedCourseData?.hole_pars
    ?.slice(0, numberOfHoles)
    .reduce((a, b) => a + (b || 0), 0) || 0;
  const currentTotal = scores.slice(0, numberOfHoles).reduce((a, b) => a + b, 0);
  const vsParScore = currentTotal - totalPar;

  const chartData = selectedCourseData?.hole_pars
    ?.slice(0, selectedCourseData.holes)
    .map((par, index) => {
      let relativeScore = null;
      if (scores[index] > 0) {
        relativeScore = scores[index] - par;
      }
      
      return {
        hole: index + 1,
        score: scores[index] || null,
        par: par || 0,
        relativeToPar: relativeScore,
      };
    }) || [];

  // Calculate score terms for display
  const getScoreTerm = (holeIndex: number): string => {
    if (!selectedCourseData?.hole_pars || scores[holeIndex] === 0) return '';
    
    const par = selectedCourseData.hole_pars[holeIndex] || 0;
    const score = scores[holeIndex];
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
  const getScoreColor = (holeIndex: number): string => {
    if (!selectedCourseData?.hole_pars || scores[holeIndex] === 0) return 'text-muted-foreground';
    
    const par = selectedCourseData.hole_pars[holeIndex] || 0;
    const score = scores[holeIndex];
    const diff = score - par;
    
    if (diff < 0) return 'text-green-500 dark:text-green-400';
    if (diff === 0) return 'text-blue-500 dark:text-blue-400';
    return 'text-red-500 dark:text-red-400';
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const holeData = payload[0].payload;
      const scoreTerm = getScoreTerm(holeData.hole - 1);
      const scoreColor = holeData.relativeToPar < 0 ? 'text-green-500' : 
                          holeData.relativeToPar === 0 ? 'text-blue-500' : 'text-red-500';
      
      return (
        <div className="bg-background border p-3 rounded shadow-lg">
          <p className="font-bold">Hole {label}</p>
          <p>Par: <span className="font-semibold">{holeData.par}</span></p>
          <p>Your Score: <span className="font-semibold">{holeData.score || '-'}</span></p>
          {holeData.relativeToPar !== null && (
            <p className={scoreColor}>
              {scoreTerm} ({holeData.relativeToPar <= 0 ? holeData.relativeToPar : `+${holeData.relativeToPar}`})
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Card - {selectedCourseData?.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Score Display */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/20 p-4 rounded-lg text-center transition-all hover:shadow-md">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="h-5 w-5 mr-2 text-muted-foreground" />
              <h3 className="text-sm text-muted-foreground">Your Score</h3>
            </div>
            <div className="text-3xl font-bold">{currentTotal}</div>
          </div>
          
          <div className="bg-secondary/20 p-4 rounded-lg text-center transition-all hover:shadow-md">
            <div className="flex items-center justify-center mb-1">
              <Flag className="h-5 w-5 mr-2 text-muted-foreground" />
              <h3 className="text-sm text-muted-foreground">Course Par</h3>
            </div>
            <div className="text-3xl font-bold">{totalPar}</div>
          </div>
          
          <div className={`p-4 rounded-lg text-center transition-all hover:shadow-md ${
            vsParScore <= 0 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            <div className="flex items-center justify-center mb-1">
              <Target className="h-5 w-5 mr-2 text-muted-foreground" />
              <h3 className="text-sm text-muted-foreground">vs Par</h3>
            </div>
            <div className={`text-3xl font-bold ${
              vsParScore <= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {vsParScore <= 0 ? vsParScore : `+${vsParScore}`}
            </div>
          </div>
        </div>

        {/* Enhanced Chart */}
        <div className="h-[300px] w-full bg-card border rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <XAxis 
                dataKey="hole"
                type="number"
                domain={[1, numberOfHoles]}
                allowDecimals={false}
                tick={{ fill: '#888' }}
                stroke="#ddd"
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fill: '#888' }}
                stroke="#ddd"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="#ddd" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#2A4746" 
                strokeWidth={3}
                dot={{ fill: "#2A4746", r: 5 }}
                activeDot={{ r: 8, fill: "#E8B87D" }}
                name="Your Score"
                animationDuration={500}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="par" 
                stroke="#8DA399" 
                strokeWidth={2}
                dot={{ fill: "#8DA399", r: 4 }}
                name="Par"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Enhanced Hole-by-Hole Score Input */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hole-by-Hole Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: numberOfHoles }).map((_, index) => {
              const par = selectedCourseData?.hole_pars?.[index] || 0;
              const score = scores[index];
              const isActive = activeHole === index;
              const scoreTerm = getScoreTerm(index);
              const scoreColor = getScoreColor(index);
              
              return (
                <div 
                  key={index} 
                  className={`border rounded-lg p-3 transition-all ${
                    isActive 
                      ? 'border-primary shadow-md' 
                      : 'hover:border-secondary/50'
                  }`}
                  onClick={() => setActiveHole(index)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-bold text-lg">Hole {index + 1}</span>
                      <span className="ml-2 text-muted-foreground">Par {par}</span>
                    </div>
                    <div className={`font-semibold ${scoreColor}`}>
                      {scoreTerm}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        decrementScore(index);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Decrease score"
                    >
                      <MinusCircle className="h-6 w-6" />
                    </button>
                    
                    <div className="relative flex-1 mx-2">
                      <Input
                        type="number"
                        min="0"
                        data-index={index}
                        value={score || ''}
                        onChange={(e) => onScoreChange(index, parseInt(e.target.value) || 0)}
                        onKeyDown={(e) => handleKeyPress(e, index)}
                        onFocus={() => setActiveHole(index)}
                        className={`text-center text-xl font-bold h-12 ${scoreColor}`}
                      />
                    </div>
                    
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        incrementScore(index);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Increase score"
                    >
                      <PlusCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
