import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CourseSearch from "@/components/rounds/CourseSearch";
import ScoreCard from "@/components/rounds/ScoreCard";
import ShotTracker from "@/components/shots/ShotTracker";
import { Target } from "lucide-react";

const AddRound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [scores, setScores] = useState<number[]>(Array(18).fill(0));
  const [notes, setNotes] = useState("");
  const [showShotTracker, setShowShotTracker] = useState(false);
  const [currentHole, setCurrentHole] = useState(1);
  const [roundId, setRoundId] = useState<string | null>(null);

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

  const selectedCourseData = courses?.find(course => course.id === selectedCourse);

  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
    setCurrentHole(index + 1);
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
      const { data, error } = await supabase
        .from('rounds')
        .insert({
          user_id: user?.id,
          course_id: selectedCourse,
          score: totalScore,
          notes,
        })
        .select('id')
        .single();

      if (error) throw error;
      
      if (data) {
        setRoundId(data.id);
      }

      toast({
        title: "Round saved successfully!",
      });
      
      if (showShotTracker) {
        // Keep on the page if shot tracker is active
        setShowShotTracker(true);
      } else {
        navigate('/profile');
      }
    } catch (error) {
      toast({
        title: "Error saving round",
        variant: "destructive",
      });
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourse(courseId);
    // Reset scores when changing course
    if (courseId) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        setScores(Array(course.holes).fill(0));
      }
    }
  };

  const toggleShotTracker = () => {
    setShowShotTracker(!showShotTracker);
  };

  if (showShotTracker && roundId) {
    return (
      <ShotTracker 
        roundId={roundId} 
        currentHole={currentHole} 
        onClose={() => {
          setShowShotTracker(false);
          navigate('/profile');
        }}
        onHoleChange={(hole) => setCurrentHole(hole)}
        totalHoles={selectedCourseData?.holes || 18}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Round Score</h1>

      <CourseSearch 
        courses={courses}
        isLoading={isLoadingCourses}
        selectedCourse={selectedCourse}
        onSelectCourse={handleSelectCourse}
      />

      {selectedCourseData && (
        <ScoreCard
          selectedCourseData={selectedCourseData}
          scores={scores}
          onScoreChange={handleScoreChange}
        />
      )}

      <div className="flex flex-col gap-3">
        <Button 
          onClick={handleSubmit} 
          className="w-full"
        >
          Save Round
        </Button>
        
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={toggleShotTracker}
        >
          <Target size={18} />
          Track Shots (New!)
        </Button>
      </div>
    </div>
  );
};

export default AddRound;
