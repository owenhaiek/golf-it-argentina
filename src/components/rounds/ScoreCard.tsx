
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

  const numberOfHoles = selectedCourseData?.holes || 18;
  const totalPar = selectedCourseData?.hole_pars
    ?.slice(0, numberOfHoles)
    .reduce((a, b) => a + (b || 0), 0) || 0;
  const currentTotal = scores.slice(0, numberOfHoles).reduce((a, b) => a + b, 0);
  const vsParScore = currentTotal - totalPar;

  const chartData = selectedCourseData?.hole_pars
    ?.slice(0, selectedCourseData.holes)
    .map((par, index) => ({
      hole: index + 1,
      score: scores[index] || null,
      par: par || 0,
    })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Card - {selectedCourseData?.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Score Display */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/20 p-4 rounded-lg text-center transition-all hover:shadow-md">
            <h3 className="text-sm text-muted-foreground mb-1">Your Score</h3>
            <div className="text-3xl font-bold">{currentTotal}</div>
          </div>
          
          <div className="bg-secondary/20 p-4 rounded-lg text-center transition-all hover:shadow-md">
            <h3 className="text-sm text-muted-foreground mb-1">Course Par</h3>
            <div className="text-3xl font-bold">{totalPar}</div>
          </div>
          
          <div className={`p-4 rounded-lg text-center transition-all hover:shadow-md ${
            vsParScore <= 0 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            <h3 className="text-sm text-muted-foreground mb-1">vs Par</h3>
            <div className={`text-3xl font-bold ${
              vsParScore <= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {vsParScore <= 0 ? vsParScore : `+${vsParScore}`}
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="hole"
                type="number"
                domain={[1, numberOfHoles]}
                allowDecimals={false}
              />
              <YAxis 
                domain={['auto', 'auto']}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#2A4746" 
                strokeWidth={2}
                dot={{ fill: "#2A4746" }}
                name="Your Score"
                animationDuration={300}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="par" 
                stroke="#888888" 
                strokeWidth={2}
                dot={{ fill: "#888888" }}
                name="Par"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: numberOfHoles }).map((_, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                Hole {index + 1}
                {selectedCourseData?.hole_pars && (
                  <div className="text-xs text-muted-foreground">
                    Par {selectedCourseData.hole_pars[index] || '-'}
                  </div>
                )}
              </div>
              <input
                type="number"
                min="0"
                data-index={index}
                value={scores[index] || ''}
                onChange={(e) => onScoreChange(index, parseInt(e.target.value) || 0)}
                onKeyDown={(e) => handleKeyPress(e, index)}
                className="w-full p-2 text-center border rounded-md"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
