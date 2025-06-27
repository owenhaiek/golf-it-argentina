
import { Check, MapPin, Flag, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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

interface CourseSelectorProps {
  courses: Course[];
  isLoading: boolean;
  selectedCourse: string;
  onSelectCourse: (courseId: string) => void;
  placeholder?: string;
}

const CourseSelector = ({ 
  courses, 
  isLoading, 
  selectedCourse, 
  onSelectCourse,
  placeholder = "Select a golf course..."
}: CourseSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { language } = useLanguage();

  const filteredCourses = courses?.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.state?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              {language === "en" ? "Select Golf Course" : "Seleccionar Campo de Golf"}
            </h3>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              {language === "en" ? "Select Golf Course" : "Seleccionar Campo de Golf"}
            </h3>
            
            <Input
              placeholder={language === "en" ? "Search golf courses..." : "Buscar campos de golf..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    {language === "en" ? "No courses found" : "No se encontraron campos"}
                  </p>
                  <p className="text-sm">
                    {language === "en" ? "Try adjusting your search" : "Intenta ajustar tu búsqueda"}
                  </p>
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <Card
                    key={course.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                      selectedCourse === course.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => onSelectCourse(course.id)}
                  >
                    <CardContent className="p-0">
                      {/* Mobile-first layout with bigger image */}
                      <div className="flex flex-col sm:flex-row">
                        {/* Image Section - Full width on mobile */}
                        {course.image_url && (
                          <div className="w-full sm:w-32 h-32 sm:h-24 flex-shrink-0">
                            <img 
                              src={course.image_url} 
                              alt={course.name}
                              className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                            />
                          </div>
                        )}
                        
                        {/* Content Section */}
                        <div className="flex-1 p-4 relative">
                          {/* Selection indicator */}
                          <div className="absolute top-3 right-3">
                            <div className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                              selectedCourse === course.id
                                ? "border-primary bg-primary"
                                : "border-border"
                            )}>
                              {selectedCourse === course.id && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>
                          
                          {/* Course Info */}
                          <div className="pr-10">
                            <h4 className="font-bold text-foreground text-lg sm:text-xl mb-2 leading-tight">
                              {course.name}
                            </h4>
                            
                            {(course.city || course.state) && (
                              <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {[course.city, course.state].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                            
                            {/* Course details - larger badges for mobile */}
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                                <Flag className="h-3 w-3 mr-1" />
                                {course.holes} {language === "en" ? "Holes" : "Hoyos"}
                              </Badge>
                              {course.par && (
                                <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                                  Par {course.par}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseSelector;
