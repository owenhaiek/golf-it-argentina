import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Shot {
  club: string;
  distance: number;
  result: string;
}

const ShotTracker = () => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [club, setClub] = useState("");
  const [distance, setDistance] = useState("");
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const handleAddShot = () => {
    if (club && distance && result) {
      setShots([...shots, { club, distance: Number(distance), result }]);
      setClub("");
      setDistance("");
      setResult("");
      toast({
        title: "Shot Added",
        description: "Your shot has been added to the tracker.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
    }
  };

  const handleClearShots = () => {
    setShots([]);
    toast({
      title: "Shots Cleared",
      description: "All shots have been cleared from the tracker.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shot Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="club">Club</Label>
            <Input
              type="text"
              id="club"
              value={club}
              onChange={(e) => setClub(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="distance">Distance (yards)</Label>
            <Input
              type="number"
              id="distance"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="result">Result</Label>
          <Input
            type="text"
            id="result"
            value={result}
            onChange={(e) => setResult(e.target.value)}
          />
        </div>
        <div className="flex justify-between">
          <Button onClick={handleAddShot}>Add Shot</Button>
          <Button variant="destructive" onClick={handleClearShots}>
            Clear Shots
          </Button>
        </div>
        {shots.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Shot Summary</h3>
            <ul>
              {shots.map((shot, index) => (
                <li key={index} className="mb-1">
                  {index + 1}. Club: {shot.club}, Distance: {shot.distance} yards,
                  Result: {shot.result}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShotTracker;
