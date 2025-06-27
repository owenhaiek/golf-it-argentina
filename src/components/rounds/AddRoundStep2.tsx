
import { useLanguage } from "@/contexts/LanguageContext";
import HolesPlayedSelector from "./HolesPlayedSelector";
import FrontBackSelector from "./FrontBackSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Flag } from "lucide-react";

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

      {/* Selected Course Display */}
      {selectedCourseData && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Course Image */}
              {selectedCourseData.image_url && (
                <div className="w-full sm:w-32 h-32 sm:h-24 flex-shrink-0">
                  <img 
                    src={selectedCourseData.image_url} 
                    alt={selectedCourseData.name}
                    className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                  />
                </div>
              )}
              
              {/* Course Information */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-foreground text-lg leading-tight">
                    {selectedCourseData.name}
                  </h3>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Selected
                  </Badge>
                </div>
                
                {(selectedCourseData.city || selectedCourseData.state) && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {[selectedCourseData.city, selectedCourseData.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                
                {/* Course Stats */}
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm font-medium">
                    <Flag className="h-3 w-3 mr-1" />
                    {selectedCourseData.holes} Holes
                  </Badge>
                  {selectedCourseData.par && (
                    <Badge variant="outline" className="text-sm font-medium">
                      Par {selectedCourseData.par}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
