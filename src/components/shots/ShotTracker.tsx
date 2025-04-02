import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Let's create a proper type definition for the shots functionality
export interface Shot {
  id: string;
  user_id: string;
  round_id?: string;
  shot_type: string;
  club: string;
  accuracy: number;
  created_at?: string;
}

export interface ShotData {
  shot_type: string;
  club: string;
  accuracy: number;
  user_id: string;
  round_id?: string;
}

const ShotTracker = () => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [newShot, setNewShot] = useState<ShotData>({
    shot_type: '',
    club: '',
    accuracy: 0,
    user_id: '',
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setNewShot(prev => ({ ...prev, user_id: user.id }));
      fetchShots();
    }
  }, [user]);

  const fetchShots = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shots')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }

      if (data) {
        setShots(data as Shot[]);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewShot(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addShot = async () => {
    try {
      const { data, error } = await supabase
        .from('shots')
        .insert([newShot]);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }

      if (data) {
        setShots([...shots, ...(data as Shot[])]);
        setNewShot({
          shot_type: '',
          club: '',
          accuracy: 0,
          user_id: user?.id || '',
        });
        toast({
          title: "Success",
          description: "Shot added successfully!",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shot Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="shot_type" className="block text-sm font-medium text-gray-700">
              Shot Type
            </label>
            <select
              id="shot_type"
              name="shot_type"
              value={newShot.shot_type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select Shot Type</option>
              <option value="Drive">Drive</option>
              <option value="Approach">Approach</option>
              <option value="Chip">Chip</option>
              <option value="Putt">Putt</option>
            </select>
          </div>
          <div>
            <label htmlFor="club" className="block text-sm font-medium text-gray-700">
              Club
            </label>
            <input
              type="text"
              name="club"
              id="club"
              value={newShot.club}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="accuracy" className="block text-sm font-medium text-gray-700">
              Accuracy
            </label>
            <input
              type="number"
              name="accuracy"
              id="accuracy"
              value={newShot.accuracy}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <Button onClick={addShot}>Add Shot</Button>
          <div>
            <ul>
              {shots.map(shot => (
                <li key={shot.id}>
                  {shot.shot_type} - {shot.club} - {shot.accuracy}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShotTracker;
