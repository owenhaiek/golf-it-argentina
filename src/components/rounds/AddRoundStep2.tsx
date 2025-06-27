
import { useLanguage } from "@/contexts/LanguageContext";
import HolesPlayedSelector from "./HolesPlayedSelector";
import FrontBackSelector from "./FrontBackSelector";

interface AddRoundStep2Props {
  holesPlayed: "9" | "18" | "27";
  onHolesPlayedChange: (value: "9" | "18" | "27") => void;
  selectedSide: "front" | "back";
  onSideChange: (side: "front" | "back") => void;
  selectedCourseData: any;
  onNext: () => void;
  onBack: () => void;
}

const AddRoundStep2 = ({ 
  holesPlayed,
  onHolesPlayedChange,
  selectedSide,
  onSideChange,
  selectedCourseData,
  onNext,
  onBack
}: AddRoundStep2Props) => {
  const { t } = useLanguage();

  const shouldShowFrontBackSelector = holesPlayed === "9" && selectedCourseData && selectedCourseData.holes >= 18;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Round Details
        </h2>
        <p className="text-muted-foreground">
          How many holes did you play?
        </p>
      </div>
      
      <HolesPlayedSelector
        holesPlayed={holesPlayed}
        onHolesPlayedChange={onHolesPlayedChange}
        maxHoles={selectedCourseData?.holes}
      />

      {shouldShowFrontBackSelector && (
        <FrontBackSelector
          selectedSide={selectedSide}
          onSideChange={onSideChange}
        />
      )}
      
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Add Scores
        </button>
      </div>
    </div>
  );
};

export default AddRoundStep2;
