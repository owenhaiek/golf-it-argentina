import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ScoreCard from "./ScoreCard";
import { Button } from "@/components/ui/button";
import { Map, Check, Flag, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface AddRoundStep3Props {
  selectedCourseData: any;
  scores: number[];
  onScoreChange: (index: number, value: number) => void;
  selectedSide?: "front" | "back";
  onSubmit: (notes: string) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const AddRoundStep3 = ({
  selectedCourseData,
  scores,
  onScoreChange,
  selectedSide,
  onSubmit,
  onBack,
  isSubmitting
}: AddRoundStep3Props) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  
  const handleSubmit = () => {
    onSubmit(notes);
  };

  // Calculate totals for display
  const holePars = selectedCourseData?.hole_pars || [];
  const numberOfHoles = selectedCourseData?.holes || 18;
  const relevantPars = selectedSide === "back" && holePars.length >= 18 
    ? holePars.slice(9, 18) 
    : holePars.slice(0, numberOfHoles);
  const totalPar = relevantPars.reduce((a: number, b: number) => a + (b || 0), 0);
  const currentTotal = scores.slice(0, numberOfHoles).reduce((a, b) => a + b, 0);
  const completedHoles = scores.slice(0, numberOfHoles).filter(s => s > 0).length;

  return (
    <div className="space-y-4">
      {/* Course info header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Flag className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-1">{selectedCourseData?.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                {numberOfHoles} hoyos
                {selectedSide && ` (${selectedSide === 'front' ? 'Front' : 'Back'} 9)`}
              </span>
              {totalPar > 0 && (
                <>
                  <span>•</span>
                  <span>Par {totalPar}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress summary */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-background/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{completedHoles}</p>
            <p className="text-xs text-muted-foreground">Completados</p>
          </div>
          <div className="bg-background/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{currentTotal || '-'}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-background/60 rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${
              currentTotal === 0 ? 'text-muted-foreground' :
              currentTotal - totalPar < 0 ? 'text-green-500' :
              currentTotal - totalPar === 0 ? 'text-blue-500' : 'text-red-500'
            }`}>
              {currentTotal === 0 ? '-' : currentTotal - totalPar > 0 ? `+${currentTotal - totalPar}` : currentTotal - totalPar}
            </p>
            <p className="text-xs text-muted-foreground">vs Par</p>
          </div>
        </div>
      </motion.div>
      
      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ScoreCard 
          selectedCourseData={selectedCourseData} 
          scores={scores} 
          onScoreChange={onScoreChange} 
          selectedSide={selectedSide} 
        />
      </motion.div>

      {/* Fixed bottom buttons - Two column layout */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex-1 h-14 rounded-2xl font-semibold text-base"
            disabled={isSubmitting}
          >
            <Map className="h-5 w-5 mr-2" />
            Volver al mapa
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Guardando...
              </div>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Guardar Ronda
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddRoundStep3;