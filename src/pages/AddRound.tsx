
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import CourseSearch from "@/components/rounds/CourseSearch";
import ScoreCard from "@/components/rounds/ScoreCard";

const AddRound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
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

    // Check if user has added any scores
    const hasScores = scores.some(score => score > 0);
    if (!hasScores) {
      toast({
        title: "Please enter at least one score",
        variant: "destructive",
      });
      return;
    }

    const totalScore = scores.slice(0, selectedCourseData?.holes || 18).reduce((a, b) => a + b, 0);
    
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
        setScores(Array(course.holes).fill(0));
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
          disabled={addRoundMutation.isPending}
        >
          {addRoundMutation.isPending ? t("addRound", "saving") : t("addRound", "saveRound")}
        </Button>
      </div>
    </div>
  );
};

export default AddRound;
