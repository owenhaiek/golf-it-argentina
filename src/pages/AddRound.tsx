import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { BackToMapButton } from "@/components/ui/BackToMapButton";
import AddRoundStep1 from "@/components/rounds/AddRoundStep1";
import AddRoundStep2 from "@/components/rounds/AddRoundStep2";
import AddRoundStep3 from "@/components/rounds/AddRoundStep3";

const AddRound = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const preselectedCourseId = searchParams.get('courseId');

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [holesPlayed, setHolesPlayed] = useState<"9" | "18" | "27">("18");
  const [selectedSide, setSelectedSide] = useState<"front" | "back">("front");
  const [scores, setScores] = useState<number[]>(Array(18).fill(0));

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

  // Pre-select course if provided
  useEffect(() => {
    if (preselectedCourseId && courses.length > 0) {
      const courseExists = courses.find(course => course.id === preselectedCourseId);
      if (courseExists) {
        setSelectedCourse(preselectedCourseId);
        setCurrentStep(2);
      }
    }
  }, [preselectedCourseId, courses]);

  const addRoundMutation = useMutation({
    mutationFn: async (data: {
      user_id: string;
      course_id: string;
      score: number;
      hole_scores: number[];
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
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: t("addRound", "roundSaved") || "Round saved successfully!",
      });
      
      navigate('/');
    },
    onError: (error) => {
      console.error('Error adding round:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  const handleHolesPlayedChange = (value: "9" | "18" | "27") => {
    setHolesPlayed(value);
    const holesCount = value === "9" ? 9 : value === "18" ? 18 : (selectedCourseData?.holes || 27);
    setScores(Array(holesCount).fill(0));
    
    if (value !== "9") {
      setSelectedSide("front");
    }
  };

  const handleSideChange = (side: "front" | "back") => {
    setSelectedSide(side);
    setScores(Array(9).fill(0));
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourse(courseId);
    if (courseId) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        const holesCount = holesPlayed === "9" ? 9 : holesPlayed === "18" ? 18 : course.holes;
        setScores(Array(holesCount).fill(0));
      }
    }
  };

  const handleSubmit = async (notes: string) => {
    if (!selectedCourse) {
      toast({
        title: t("addRound", "selectCourse") || "Please select a course",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Please log in to save rounds",
        variant: "destructive",
      });
      return;
    }

    const actualHolesPlayed = parseInt(holesPlayed);
    const holesCount = actualHolesPlayed;
    
    const relevantScores = scores.slice(0, holesCount);
    const hasZeroOrEmptyScore = relevantScores.some(score => !score || score === 0);
    
    if (hasZeroOrEmptyScore) {
      toast({
        title: "Invalid scores",
        description: "All holes must have a score greater than 0",
        variant: "destructive",
      });
      return;
    }

    const totalScore = scores.slice(0, holesCount).reduce((a, b) => a + b, 0);
    
    let actualHoleScores: number[];
    
    if (holesCount === 9 && selectedCourseData && selectedCourseData.holes >= 18) {
      if (selectedSide === "back") {
        actualHoleScores = Array(9).fill(0).concat(scores.slice(0, 9));
      } else {
        actualHoleScores = scores.slice(0, 9);
      }
    } else {
      actualHoleScores = scores.slice(0, holesCount);
    }
    
    let roundNotes = `${holesCount} holes played`;
    if (holesCount === 9 && selectedCourseData && selectedCourseData.holes >= 18) {
      roundNotes += ` (${selectedSide} 9)`;
    }
    if (notes.trim()) {
      roundNotes += `. ${notes}`;
    }
    
    addRoundMutation.mutate({
      user_id: user.id,
      course_id: selectedCourse,
      score: totalScore,
      hole_scores: actualHoleScores,
      notes: roundNotes,
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {t("addRound", "title")} - {t("addRound", "step")} {currentStep}/3
          </h1>
        </div>
        
        {/* Progress bar */}
        <div className="flex gap-2 mt-3">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-colors ${
                step <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        {currentStep === 1 && (
          <AddRoundStep1
            courses={courses}
            isLoadingCourses={isLoadingCourses}
            selectedCourse={selectedCourse}
            onSelectCourse={handleSelectCourse}
            onNext={() => setCurrentStep(2)}
          />
        )}
        
        {currentStep === 2 && (
          <AddRoundStep2
            holesPlayed={holesPlayed}
            onHolesPlayedChange={handleHolesPlayedChange}
            selectedSide={selectedSide}
            onSideChange={handleSideChange}
            selectedCourseData={selectedCourseData}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        
        {currentStep === 3 && selectedCourseData && (
          <AddRoundStep3
            selectedCourseData={{
              ...selectedCourseData,
              holes: parseInt(holesPlayed)
            }}
            scores={scores}
            onScoreChange={handleScoreChange}
            selectedSide={holesPlayed === "9" && selectedCourseData.holes >= 18 ? selectedSide : undefined}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(2)}
            isSubmitting={addRoundMutation.isPending}
          />
        )}
      </div>

      {/* Back to map button */}
      <BackToMapButton />
    </div>
  );
};

export default AddRound;
