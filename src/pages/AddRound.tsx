
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AddRound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [scores, setScores] = useState<number[]>(Array(18).fill(0));
  const [notes, setNotes] = useState("");

  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('id, name, holes, hole_pars')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const selectedCourseData = courses?.find(course => course.id === selectedCourse);

  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast({
        title: "Please select a course",
        variant: "destructive",
      });
      return;
    }

    const totalScore = scores.reduce((a, b) => a + b, 0);
    
    try {
      const { error } = await supabase
        .from('rounds')
        .insert({
          user_id: user?.id,
          course_id: selectedCourse,
          score: totalScore,
          notes,
        });

      if (error) throw error;

      toast({
        title: "Round saved successfully!",
      });
      
      navigate('/profile');
    } catch (error) {
      toast({
        title: "Error saving round",
        variant: "destructive",
      });
    }
  };

  const chartData = selectedCourseData?.hole_pars?.map((par, index) => ({
    hole: `${index + 1}`,
    score: scores[index] || 0,
    par: par,
  })) || [];

  const numberOfHoles = selectedCourseData?.holes || 18;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Round Score</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses?.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score Card</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="hole" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2A4746" 
                  strokeWidth={2}
                  dot={{ fill: "#2A4746" }}
                  name="Your Score"
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
                      Par {selectedCourseData.hole_pars[index]}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  value={scores[index] || ''}
                  onChange={(e) => handleScoreChange(index, parseInt(e.target.value) || 0)}
                  className="w-full p-2 text-center border rounded-md"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSubmit} 
        className="w-full"
      >
        Save Round
      </Button>
    </div>
  );
};

export default AddRound;
