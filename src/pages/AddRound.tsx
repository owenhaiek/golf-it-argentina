
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Search } from "lucide-react";

const AddRound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [scores, setScores] = useState<number[]>(Array(18).fill(0));
  const [notes, setNotes] = useState("");
  const [showCourses, setShowCourses] = useState(false);

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('id, name, holes, hole_pars')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCourseData = courses?.find(course => course.id === selectedCourse);

  // Show courses only when searching
  useEffect(() => {
    setShowCourses(searchQuery.length > 0);
  }, [searchQuery]);

  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

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

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast({
        title: "Please select a course",
        variant: "destructive",
      });
      return;
    }

    const totalScore = scores.slice(0, selectedCourseData?.holes || 18).reduce((a, b) => a + b, 0);
    
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

  const chartData = selectedCourseData?.hole_pars?.slice(0, selectedCourseData.holes).map((par, index) => ({
    hole: `${index + 1}`,
    score: scores[index] || 0,
    par: par,
  })) || [];

  const numberOfHoles = selectedCourseData?.holes || 18;
  const totalPar = selectedCourseData?.hole_pars?.slice(0, numberOfHoles).reduce((a, b) => a + b, 0) || 0;
  const currentTotal = scores.slice(0, numberOfHoles).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Round Score</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {showCourses && filteredCourses.length > 0 && (
            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {filteredCourses.map((course) => (
                <Button
                  key={course.id}
                  variant={selectedCourse === course.id ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => {
                    setSelectedCourse(course.id);
                    setSearchQuery("");
                    setShowCourses(false);
                  }}
                >
                  <span>{course.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Par {course.hole_pars?.reduce((a, b) => a + b, 0)}
                  </span>
                </Button>
              ))}
            </div>
          )}
          {showCourses && filteredCourses.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No courses found
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCourseData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Score Card</span>
              <div className="text-sm font-normal space-y-1 text-right">
                <div>Your Score: {currentTotal}</div>
                <div>Course Par: {totalPar}</div>
                <div>vs Par: {currentTotal - totalPar}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-[300px] w-full">
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
                    animationDuration={300}
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
                    data-index={index}
                    value={scores[index] || ''}
                    onChange={(e) => handleScoreChange(index, parseInt(e.target.value) || 0)}
                    onKeyDown={(e) => handleKeyPress(e, index)}
                    className="w-full p-2 text-center border rounded-md"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
