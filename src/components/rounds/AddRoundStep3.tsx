import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ScoreCard from "./ScoreCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Map, Check } from "lucide-react";
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
  return <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("addRound", "enterScores") || "Enter Your Scores"}
        </h2>
        <p className="text-muted-foreground">
          {t("addRound", "addScoreHole") || "Add your score for each hole"}
        </p>
      </div>
      
      <ScoreCard selectedCourseData={selectedCourseData} scores={scores} onScoreChange={onScoreChange} selectedSide={selectedSide} />

      
      
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
    </div>;
};
export default AddRoundStep3;