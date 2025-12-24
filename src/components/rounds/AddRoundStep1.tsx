import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, MapPin, Flag, Check, ChevronRight, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface Course {
  id: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  image_url?: string;
  address?: string;
}

interface AddRoundStep1Props {
  courses: Course[];
  isLoadingCourses: boolean;
  selectedCourse: string;
  onSelectCourse: (courseId: string) => void;
  onNext: () => void;
  onExitToMap: () => void;
}

const AddRoundStep1 = ({ 
  courses, 
  isLoadingCourses, 
  selectedCourse, 
  onSelectCourse, 
  onNext,
  onExitToMap
}: AddRoundStep1Props) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = courses?.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.state?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoadingCourses) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground">{t("common", "loading") || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("addRound", "searchCourse") || "Buscar campo de golf..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Course list */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="pb-32 space-y-3">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("common", "noResults") || "No se encontraron campos"}</p>
            </div>
          ) : (
            filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onSelectCourse(course.id)}
                className={cn(
                  "relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300",
                  selectedCourse === course.id
                    ? "ring-2 ring-primary scale-[1.02]"
                    : "hover:scale-[1.01]"
                )}
              >
                <div className="relative h-32">
                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Flag className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {selectedCourse === course.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="h-5 w-5 text-primary-foreground" />
                    </motion.div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-white text-base leading-tight line-clamp-1">{course.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      {(course.city || course.state) && (
                        <span className="text-white/80 text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="line-clamp-1">{[course.city, course.state].filter(Boolean).join(', ')}</span>
                        </span>
                      )}
                      <span className="text-white/80 text-xs flex items-center gap-1 whitespace-nowrap">
                        <Flag className="h-3 w-3 flex-shrink-0" />
                        {course.holes}h
                      </span>
                      {course.par && (
                        <span className="text-white/80 text-xs whitespace-nowrap">
                          Par {course.par}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Fixed bottom buttons - Two column layout */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-[calc(1.5rem+var(--safe-area-bottom))] sm:pb-[calc(1.5rem+var(--safe-area-bottom))]">
        <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3 mb-2">
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
            disabled={!selectedCourse}
            className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium sm:font-semibold text-sm sm:text-base shadow-lg shadow-primary/25 px-3 sm:px-4"
          >
            <span className="truncate">Continuar</span>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1.5 sm:ml-2 flex-shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddRoundStep1;