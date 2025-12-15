import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, MapPin, Flag, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

const AddRoundStep1 = ({ 
  courses, 
  isLoadingCourses, 
  selectedCourse, 
  onSelectCourse, 
  onNext 
}: AddRoundStep1Props) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = courses?.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.state?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelectAndContinue = (courseId: string) => {
    onSelectCourse(courseId);
  };

  if (isLoadingCourses) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground">{t("common", "loading") || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("addRound", "searchCourse") || "Search golf course..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground px-1">
        {filteredCourses.length} {filteredCourses.length === 1 ? 'campo' : 'campos'} encontrados
      </p>

      {/* Course list */}
      <div className="space-y-3">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <Flag className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground mb-1">
              {t("common", "noResults") || "No courses found"}
            </p>
            <p className="text-sm text-muted-foreground/70">
              {t("common", "tryDifferentSearch") || "Try a different search term"}
            </p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isSelected = selectedCourse === course.id;
            
            return (
              <button
                key={course.id}
                onClick={() => handleSelectAndContinue(course.id)}
                className={cn(
                  "w-full text-left rounded-2xl overflow-hidden transition-all duration-200",
                  "border-2 bg-card",
                  isSelected 
                    ? "border-primary shadow-lg shadow-primary/20" 
                    : "border-transparent hover:border-border"
                )}
              >
                <div className="flex">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-muted">
                    {course.image_url ? (
                      <img 
                        src={course.image_url} 
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Flag className="h-8 w-8 text-primary/40" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                    <h3 className="font-semibold text-foreground truncate pr-8">
                      {course.name}
                    </h3>
                    
                    {(course.city || course.state) && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {[course.city, course.state].filter(Boolean).join(', ')}
                        </span>
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                        {course.holes} hoyos
                      </span>
                      {course.par && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          Par {course.par}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  <div className="flex items-center pr-4">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
      
      {/* Continue button - fixed at bottom */}
      {selectedCourse && (
        <div className="fixed bottom-20 left-4 right-4 z-20">
          <button
            onClick={onNext}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-transform"
          >
            {t("common", "continue") || "Continue"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddRoundStep1;
