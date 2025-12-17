import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flag, MapPin, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const handleExitToMap = () => {
    sessionStorage.setItem('map-entry-animation', 'true');
    navigate('/');
  };

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
      
      navigate('/profile');
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

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Selecciona el campo";
      case 2: return "Configura tu ronda";
      case 3: return "Ingresa tus scores";
      default: return "";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Modern Header - matching CreateTournament/CreateMatch style */}
      <div className="flex-shrink-0 p-4 bg-background/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate(-1)}
              className="h-10 w-10 p-0 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Flag className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{t("addRound", "title") || "Agregar Ronda"}</h1>
                <p className="text-xs text-muted-foreground">
                  {getStepDescription()}
                </p>
              </div>
            </div>
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === currentStep ? 'w-6 bg-primary' : s < currentStep ? 'w-2 bg-primary' : 'w-2 bg-muted'
                }`}
                layoutId={`round-step-${s}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col p-4"
            >
              <AddRoundStep1
                courses={courses}
                isLoadingCourses={isLoadingCourses}
                selectedCourse={selectedCourse}
                onSelectCourse={handleSelectCourse}
                onNext={() => setCurrentStep(2)}
                onExitToMap={() => setShowExitConfirmation(true)}
              />
            </motion.div>
          )}
          
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-auto"
            >
              <div className="p-4 pb-32 max-w-2xl mx-auto">
                <AddRoundStep2
                  holesPlayed={holesPlayed}
                  onHolesPlayedChange={handleHolesPlayedChange}
                  selectedSide={selectedSide}
                  onSideChange={handleSideChange}
                  selectedCourseData={selectedCourseData}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                  onExitToMap={() => setShowExitConfirmation(true)}
                />
              </div>
            </motion.div>
          )}
          
          {currentStep === 3 && selectedCourseData && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-auto"
            >
              <div className="p-4 pb-32 max-w-2xl mx-auto">
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
                  onExitToMap={() => setShowExitConfirmation(true)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
        <AlertDialogContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir al mapa?</AlertDialogTitle>
            <AlertDialogDescription>
              Perderás el progreso de la ronda que estás creando. ¿Estás seguro que deseas volver al mapa?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExitToMap}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Sí, salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddRound;