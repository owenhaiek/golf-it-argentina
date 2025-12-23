import { useLanguage } from "@/contexts/LanguageContext";
import HolesPlayedSelector from "./HolesPlayedSelector";
import FrontBackSelector from "./FrontBackSelector";
import { Button } from "@/components/ui/button";
import { MapPin, Flag, Map, ChevronRight, Check } from "lucide-react";
import { motion } from "framer-motion";

interface AddRoundStep2Props {
  holesPlayed: "9" | "18" | "27";
  onHolesPlayedChange: (value: "9" | "18" | "27") => void;
  selectedSide: "front" | "back";
  onSideChange: (side: "front" | "back") => void;
  selectedCourseData: any;
  onNext: () => void;
  onBack: () => void;
  onExitToMap: () => void;
}

const AddRoundStep2 = ({ 
  holesPlayed,
  onHolesPlayedChange,
  selectedSide,
  onSideChange,
  selectedCourseData,
  onNext,
  onBack,
  onExitToMap
}: AddRoundStep2Props) => {
  const { t } = useLanguage();

  const shouldShowFrontBackSelector = holesPlayed === "9" && selectedCourseData && selectedCourseData.holes >= 18;

  return (
    <div className="space-y-6">
      {/* Selected Course Preview - Modern card style */}
      {selectedCourseData && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="relative h-24">
            <img
              src={selectedCourseData.image_url || '/placeholder.svg'}
              alt={selectedCourseData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
            
            <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
            
            <div className="absolute inset-0 flex items-center p-4">
              <div>
                <p className="text-primary text-xs font-medium">Campo seleccionado</p>
                <h3 className="font-semibold text-white line-clamp-1">{selectedCourseData.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {(selectedCourseData.city || selectedCourseData.state) && (
                    <span className="text-white/70 text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{[selectedCourseData.city, selectedCourseData.state].filter(Boolean).join(', ')}</span>
                    </span>
                  )}
                  <span className="text-white/70 text-xs flex items-center gap-1">
                    <Flag className="h-3 w-3" />
                    {selectedCourseData.holes}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Section title */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">
          Configura tu ronda
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          ¿Cuántos hoyos vas a jugar?
        </p>
      </div>

      {/* Holes selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <HolesPlayedSelector
          holesPlayed={holesPlayed}
          onHolesPlayedChange={onHolesPlayedChange}
          maxHoles={selectedCourseData?.holes}
        />
      </motion.div>

      {/* Front/Back selector */}
      {shouldShowFrontBackSelector && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FrontBackSelector
            selectedSide={selectedSide}
            onSideChange={onSideChange}
          />
        </motion.div>
      )}
      
      {/* Fixed bottom buttons - Two column layout */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-[calc(0.75rem+var(--safe-area-bottom))] sm:pb-[calc(1rem+var(--safe-area-bottom))]">
        <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3">
          <Button
            onClick={onExitToMap}
            variant="outline"
            className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl font-medium sm:font-semibold text-sm sm:text-base px-3 sm:px-4"
          >
            <Map className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Mapa</span>
          </Button>
          <Button
            onClick={onNext}
            className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium sm:font-semibold text-sm sm:text-base shadow-lg shadow-primary/25 px-3 sm:px-4"
          >
            <span className="truncate">Scores</span>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1.5 sm:ml-2 flex-shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddRoundStep2;