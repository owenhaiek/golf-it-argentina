import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import CourseSearch from "@/components/rounds/CourseSearch";
import ScoreCard from "@/components/rounds/ScoreCard";

const AddRound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [holesPlayed, setHolesPlayed] = useState<"9" | "18">("18");
  const [scores, setScores] = useState<number[]>(Array(18).fill(0));
  const [notes, setNotes] = useState("");

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('id, name, holes, hole_pars, opening_hours')
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
  };

  const handleHolesPlayedChange = (value: "9" | "18") => {
    setHolesPlayed(value);
    // Reset scores when changing holes played
    const holesCount = value === "9" ? 9 : (selectedCourseData?.holes || 18);
    setScores(Array(holesCount).fill(0));
  };

  const addRoundMutation = useMutation({
    mutationFn: async (data: {
      user_id: string;
      course_id: string;
      score: number;
      notes: string;
      date: string;
    }) => {
      const { data: newRound, error } = await supabase
        .from('rounds')
        .insert(data)
        .select('*')
        .single();
      
      if (error) throw error;
      return newRound;
    },
    onSuccess: () => {
      // Invalidate the rounds query to refresh the rounds list
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: t("addRound", "saveSuccess"),
      });
      
      navigate('/profile');
    },
    onError: (error) => {
      console.error('Error adding round:', error);
      toast({
        title: t("common", "error"),
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast({
        title: t("addRound", "selectCourseError"),
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: t("addRound", "loginError"),
        variant: "destructive",
      });
      return;
    }

    // Check if user has added any scores for the holes they played
    const holesCount = holesPlayed === "9" ? 9 : (selectedCourseData?.holes || 18);
    const hasScores = scores.slice(0, holesCount).some(score => score > 0);
    if (!hasScores) {
      toast({
        title: "Please enter at least one score",
        variant: "destructive",
      });
      return;
    }

    const totalScore = scores.slice(0, holesCount).reduce((a, b) => a + b, 0);
    
    try {
      addRoundMutation.mutate({
        user_id: user.id,
        course_id: selectedCourse,
        score: totalScore,
        notes,
        date: new Date().toISOString().split('T')[0] // Add today's date
      });
    } catch (error) {
      // Error handling is done in the mutation callbacks
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourse(courseId);
    // Reset scores when changing course
    if (courseId) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        const holesCount = holesPlayed === "9" ? 9 : course.holes;
        setScores(Array(holesCount).fill(0));
      }
    }
  };

  return (
    <div className="space-y-6 pb-28">
      <h1 className="text-2xl font-bold">{t("addRound", "title")}</h1>

      <CourseSearch 
        courses={courses}
        isLoading={isLoadingCourses}
        selectedCourse={selectedCourse}
        onSelectCourse={handleSelectCourse}
      />

      {selectedCourse && (
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Holes Played</h3>
            <ToggleGroup 
              type="single" 
              value={holesPlayed} 
              onValueChange={(value) => value && handleHolesPlayedChange(value as "9" | "18")}
              className="justify-start"
            >
              <ToggleGroupItem value="9" aria-label="9 holes" className="px-6">
                9 Holes
              </ToggleGroupItem>
              <ToggleGroupItem value="18" aria-label="18 holes" className="px-6">
                18 Holes
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      )}

      {selectedCourseData && (
        <ScoreCard
          selectedCourseData={{
            ...selectedCourseData,
            holes: holesPlayed === "9" ? 9 : selectedCourseData.holes
          }}
          scores={scores}
          onScoreChange={handleScoreChange}
        />
      )}

      <div className="flex flex-col gap-3">
        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={addRoundMutation.isPending}
        >
          {addRoundMutation.isPending ? t("addRound", "saving") : t("addRound", "saveRound")}
        </Button>
      </div>
    </div>
  );
};

export default AddRound;
