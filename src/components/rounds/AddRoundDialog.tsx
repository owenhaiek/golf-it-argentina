
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import AddRoundStep1 from "./AddRoundStep1";
import AddRoundStep2 from "./AddRoundStep2";
import AddRoundStep3 from "./AddRoundStep3";

interface AddRoundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddRoundDialog = ({ open, onOpenChange }: AddRoundDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
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
        title: "Round saved successfully!",
      });
      
      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
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

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedCourse("");
    setHolesPlayed("18");
    setSelectedSide("front");
    setScores(Array(18).fill(0));
  };

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
        title: "Please select a course",
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
    
    const hasScores = scores.slice(0, holesCount).some(score => score > 0);
    if (!hasScores) {
      toast({
        title: "Please enter at least one score",
        variant: "destructive",
      });
      return;
    }

    const totalScore = scores.slice(0, holesCount).reduce((a, b) => a + b, 0);
    
    // For 9-hole rounds, we need to map scores to the correct holes (front 9 or back 9)
    let actualHoleScores: number[];
    
    if (holesCount === 9 && selectedCourseData && selectedCourseData.holes >= 18) {
      if (selectedSide === "back") {
        // Create array with 18 holes, fill first 9 with 0s and last 9 with actual scores
        actualHoleScores = Array(9).fill(0).concat(scores.slice(0, 9));
      } else {
        // Front 9: just use the scores as they are for holes 1-9
        actualHoleScores = scores.slice(0, 9);
      }
    } else {
      // For 18-hole rounds or other configurations, use scores as entered
      actualHoleScores = scores.slice(0, holesCount);
    }
    
    let roundNotes = `${holesCount} holes played`;
    if (holesCount === 9 && selectedCourseData && selectedCourseData.holes >= 18) {
      roundNotes += ` (${selectedSide} 9)`;
    }
    if (notes.trim()) {
      roundNotes += `. ${notes}`;
    }
    
    console.log('Saving round with hole scores:', actualHoleScores);
    console.log('Round configuration:', { holesCount, selectedSide, totalScore });
    
    addRoundMutation.mutate({
      user_id: user.id,
      course_id: selectedCourse,
      score: totalScore,
      hole_scores: actualHoleScores,
      notes: roundNotes,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl h-[95vh] sm:h-[90vh] max-h-screen flex flex-col p-0 m-0">
        <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-3 sm:pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl font-bold">
              Add Round - Step {currentStep} of 3
            </DialogTitle>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
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
      </DialogContent>
    </Dialog>
  );
};

export default AddRoundDialog;
