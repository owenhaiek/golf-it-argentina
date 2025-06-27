import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import ScoreCard from "./ScoreCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const {
    t
  } = useLanguage();
  const [notes, setNotes] = useState("");
  const handleSubmit = () => {
    onSubmit(notes);
  };
  return <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Enter Your Scores
        </h2>
        <p className="text-muted-foreground">
          Add your score for each hole
        </p>
      </div>
      
      <ScoreCard selectedCourseData={selectedCourseData} scores={scores} onScoreChange={onScoreChange} selectedSide={selectedSide} />

      
      
      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1" disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Round"}
        </Button>
      </div>
    </div>;
};
export default AddRoundStep3;