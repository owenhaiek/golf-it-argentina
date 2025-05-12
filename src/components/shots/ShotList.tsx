
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Shot {
  id: string;
  shot_type: string;
  club: string;
  distance?: number;
  accuracy: string;
  notes?: string;
}

interface ShotListProps {
  shots: Shot[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

const ShotList: React.FC<ShotListProps> = ({ shots, isLoading, onDelete }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="mt-2 flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (shots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No shots recorded for this hole yet.</p>
        <p className="text-sm mt-1">Click on the "Add Shot" tab to start tracking!</p>
      </div>
    );
  }

  const getAccuracyColor = (accuracy: string) => {
    switch (accuracy) {
      case "On Target": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Left": return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      case "Right": return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      default: return "";
    }
  };

  const getShotTypeIcon = (shotType: string) => {
    switch (shotType) {
      case "Drive": return "🚀";
      case "Approach": return "🎯";
      case "Chip": return "💫";
      case "Putt": return "🏌️";
      case "Bunker": return "⛳";
      case "Recovery": return "🔄";
      default: return "🏌️";
    }
  };

  return (
    <div className="space-y-3">
      {shots.map((shot, index) => (
        <Card key={shot.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex justify-between items-center p-3 pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getShotTypeIcon(shot.shot_type)}</span>
                <span className="font-medium">{shot.shot_type}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                onClick={() => onDelete(shot.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Club:</span>
                <span className="font-medium">{shot.club}</span>
              </div>
              
              {shot.distance && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="font-medium">{shot.distance} yards</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accuracy:</span>
                <Badge className={getAccuracyColor(shot.accuracy)}>
                  {shot.accuracy}
                </Badge>
              </div>
              
              {shot.notes && (
                <div className="text-sm mt-2 pt-2 border-t border-border/50">
                  <p className="text-muted-foreground text-xs mb-1">Notes:</p>
                  <p className="text-foreground">{shot.notes}</p>
                </div>
              )}
            </div>
            
            {index < shots.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ShotList;
