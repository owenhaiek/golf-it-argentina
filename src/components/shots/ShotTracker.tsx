
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Target, Save, X, Flag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ShotList from "./ShotList";

interface ShotTrackerProps {
  roundId: string;
  currentHole: number;
  totalHoles: number;
  onClose: () => void;
  onHoleChange: (hole: number) => void;
}

type ShotData = {
  round_id: string;
  hole_number: number;
  club: string;
  distance?: number;
  accuracy: string;
  shot_type: string;
  notes?: string;
};

const clubOptions = [
  "Driver", "3 Wood", "5 Wood", "3 Hybrid", "4 Hybrid",
  "3 Iron", "4 Iron", "5 Iron", "6 Iron", "7 Iron", "8 Iron", "9 Iron",
  "PW", "GW", "SW", "LW", "Putter"
];

const shotTypeOptions = ["Drive", "Approach", "Chip", "Putt", "Bunker", "Recovery"];
const accuracyOptions = ["On Target", "Left", "Right"];

const ShotTracker: React.FC<ShotTrackerProps> = ({ 
  roundId, 
  currentHole, 
  totalHoles,
  onClose, 
  onHoleChange 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("add");
  
  const [shotData, setShotData] = useState<ShotData>({
    round_id: roundId,
    hole_number: currentHole,
    club: "Driver",
    distance: undefined,
    accuracy: "On Target",
    shot_type: "Drive",
    notes: "",
  });

  useEffect(() => {
    setShotData(prev => ({
      ...prev,
      hole_number: currentHole
    }));
  }, [currentHole]);

  const { data: shots = [], isLoading } = useQuery({
    queryKey: ['shots', roundId, currentHole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shots')
        .select('*')
        .eq('round_id', roundId)
        .eq('hole_number', currentHole)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const addShotMutation = useMutation({
    mutationFn: async (newShot: ShotData) => {
      const { data, error } = await supabase
        .from('shots')
        .insert(newShot)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shots', roundId, currentHole] });
      toast({
        title: "Shot saved successfully",
      });
      resetShotForm();
      setActiveTab("view");
    },
    onError: (error) => {
      toast({
        title: "Error saving shot",
        variant: "destructive",
      });
      console.error("Error saving shot:", error);
    },
  });

  const deleteShotMutation = useMutation({
    mutationFn: async (shotId: string) => {
      const { error } = await supabase
        .from('shots')
        .delete()
        .eq('id', shotId);
      
      if (error) throw error;
      return shotId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shots', roundId, currentHole] });
      toast({
        title: "Shot deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting shot",
        variant: "destructive",
      });
      console.error("Error deleting shot:", error);
    },
  });

  const handlePrevHole = () => {
    if (currentHole > 1) {
      onHoleChange(currentHole - 1);
    }
  };

  const handleNextHole = () => {
    if (currentHole < totalHoles) {
      onHoleChange(currentHole + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShotData({
      ...shotData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setShotData({
      ...shotData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse distance to number if provided
    const finalShotData = {
      ...shotData,
      distance: shotData.distance ? parseInt(String(shotData.distance)) : undefined
    };
    
    addShotMutation.mutate(finalShotData);
  };

  const resetShotForm = () => {
    setShotData({
      round_id: roundId,
      hole_number: currentHole,
      club: "Driver",
      distance: undefined,
      accuracy: "On Target",
      shot_type: "Drive",
      notes: "",
    });
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Shot Tracker</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Hole {currentHole}</CardTitle>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevHole}
                disabled={currentHole === 1}
                aria-label="Previous hole"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextHole}
                disabled={currentHole === totalHoles}
                aria-label="Next hole"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Shot</TabsTrigger>
              <TabsTrigger value="view">View Shots ({shots.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shot_type">Shot Type</Label>
                    <Select 
                      value={shotData.shot_type} 
                      onValueChange={(value) => handleSelectChange('shot_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shot type" />
                      </SelectTrigger>
                      <SelectContent>
                        {shotTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="club">Club</Label>
                    <Select 
                      value={shotData.club} 
                      onValueChange={(value) => handleSelectChange('club', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select club" />
                      </SelectTrigger>
                      <SelectContent>
                        {clubOptions.map((club) => (
                          <SelectItem key={club} value={club}>{club}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (yards)</Label>
                    <Input
                      id="distance"
                      name="distance"
                      type="number"
                      placeholder="Enter distance"
                      value={shotData.distance || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accuracy">Accuracy</Label>
                    <Select 
                      value={shotData.accuracy} 
                      onValueChange={(value) => handleSelectChange('accuracy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select accuracy" />
                      </SelectTrigger>
                      <SelectContent>
                        {accuracyOptions.map((accuracy) => (
                          <SelectItem key={accuracy} value={accuracy}>{accuracy}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Any notes about this shot"
                    value={shotData.notes || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={addShotMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Shot
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="view" className="mt-4">
              <ShotList 
                shots={shots} 
                isLoading={isLoading} 
                onDelete={(id) => deleteShotMutation.mutate(id)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => {
              if (currentHole < totalHoles) {
                handleNextHole();
              } else {
                onClose();
              }
            }}
          >
            {currentHole < totalHoles ? (
              <>
                <Flag className="h-4 w-4 mr-2" />
                Next Hole
              </>
            ) : (
              'Finish Round'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShotTracker;
