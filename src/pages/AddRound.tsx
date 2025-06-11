
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import CourseSearch from "@/components/rounds/CourseSearch";
import ScoreCard from "@/components/rounds/ScoreCard";

const AddRound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [holesPlayed, setHolesPlayed] = useState<"9" | "18" | "27">("18");
  const [scores, setScores] = useState<number[]>(Array(18).fill(0));
  const [notes, setNotes] = useState("");

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('id, name, holes, hole_pars, opening_hours, image_url, address, city, state, par')
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

  const handleHolesPlayedChange = (value: "9" | "18" | "27") => {
    setHolesPlayed(value);
    // Reset scores when changing holes played
    const holesCount = value === "9" ? 9 : value === "18" ? 18 : (selectedCourseData?.holes || 27);
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

    // Get the actual number of holes played based on selection
    const actualHolesPlayed = parseInt(holesPlayed);
    const holesCount = actualHolesPlayed;
    
    // Check if user has added any scores for the holes they played
    const hasScores = scores.slice(0, holesCount).some(score => score > 0);
    if (!hasScores) {
      toast({
        title: "Please enter at least one score",
        variant: "destructive",
      });
      return;
    }

    // Calculate total score only for the holes actually played
    const totalScore = scores.slice(0, holesCount).reduce((a, b) => a + b, 0);
    
    try {
      addRoundMutation.mutate({
        user_id: user.id,
        course_id: selectedCourse,
        score: totalScore,
        notes: `${holesCount} holes played. ${notes}`.trim(),
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
        const holesCount = holesPlayed === "9" ? 9 : holesPlayed === "18" ? 18 : course.holes;
        setScores(Array(holesCount).fill(0));
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 p-4 bg-white border-b">
        <h1 className="text-2xl font-bold">{t("addRound", "title")}</h1>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-28">
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
                  onValueChange={(value) => value && handleHolesPlayedChange(value as "9" | "18" | "27")}
                  className="justify-start"
                >
                  <ToggleGroupItem value="9" aria-label="9 holes" className="px-6">
                    9 Holes
                  </ToggleGroupItem>
                  <ToggleGroupItem value="18" aria-label="18 holes" className="px-6">
                    18 Holes
                  </ToggleGroupItem>
                  {selectedCourseData?.holes === 27 && (
                    <ToggleGroupItem value="27" aria-label="27 holes" className="px-6">
                      27 Holes
                    </ToggleGroupItem>
                  )}
                </ToggleGroup>
              </div>
            </div>
          )}

          {selectedCourseData && (
            <ScoreCard
              selectedCourseData={{
                ...selectedCourseData,
                holes: parseInt(holesPlayed)
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
      </ScrollArea>
    </div>
  );
};

export default AddRound;
