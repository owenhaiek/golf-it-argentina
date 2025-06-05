
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Clock, Flag, MapPin } from "lucide-react";
import { isCurrentlyOpen, formatOpeningHours } from "@/utils/openingHours";
import { useLanguage } from "@/contexts/LanguageContext";

interface Course {
  id: string;
  name: string;
  holes: number;
  hole_pars: number[];
  opening_hours?: any;
  image_url?: string;
  address?: string;
  city?: string;
  state?: string;
  par?: number;
}

interface CourseSearchProps {
  courses: Course[];
  isLoading: boolean;
  selectedCourse: string;
  onSelectCourse: (courseId: string) => void;
}

const CourseSearch = ({ 
  courses, 
  isLoading, 
  selectedCourse, 
  onSelectCourse 
}: CourseSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCourses, setShowCourses] = useState(true);
  const { t } = useLanguage();

  const selectedCourseData = courses?.find(course => course.id === selectedCourse);

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const coursePar = (course: Course) => {
    if (course.par) return course.par;
    return course.hole_pars
      ?.slice(0, course.holes)
      .reduce((a, b) => a + (b || 0), 0) || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("addRound", "selectCourse")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("addRound", "searchPlaceholder")}
            value={selectedCourseData ? selectedCourseData.name : searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedCourse && e.target.value !== selectedCourseData?.name) {
                onSelectCourse("");
              }
            }}
            onFocus={() => {
              if (selectedCourse) {
                setSearchQuery("");
                onSelectCourse("");
              }
              setShowCourses(true);
            }}
            className="pl-9"
          />
        </div>

        {/* Selected Course Display */}
        {selectedCourse && selectedCourseData && (
          <Card className="border-2 border-primary bg-primary/5">
            <CardContent className="p-0">
              {selectedCourseData.image_url && (
                <div className="w-full h-48">
                  <img
                    src={selectedCourseData.image_url}
                    alt={selectedCourseData.name}
                    className="w-full h-full object-cover rounded-t-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop';
                    }}
                  />
                </div>
              )}
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-lg">{selectedCourseData.name}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Flag className="h-4 w-4" />
                    <span>{selectedCourseData.holes} holes • Par {coursePar(selectedCourseData)}</span>
                  </div>
                  {(selectedCourseData.address || selectedCourseData.city) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{[selectedCourseData.city, selectedCourseData.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onSelectCourse("");
                    setSearchQuery("");
                    setShowCourses(true);
                  }}
                >
                  Change Course
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course List */}
        {showCourses && !selectedCourse && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => {
                    const open = isCurrentlyOpen(course.opening_hours);
                    const location = [course.city, course.state].filter(Boolean).join(', ');
                    
                    return (
                      <Card
                        key={course.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border hover:border-primary/50"
                        onClick={() => {
                          onSelectCourse(course.id);
                          setSearchQuery("");
                          setShowCourses(false);
                        }}
                      >
                        <CardContent className="p-0">
                          <div className="w-full h-48">
                            <img
                              src={course.image_url || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop'}
                              alt={course.name}
                              className="w-full h-full object-cover rounded-t-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop';
                              }}
                            />
                          </div>
                          <div className="p-4 space-y-2">
                            <h3 className="font-semibold text-lg leading-tight">{course.name}</h3>
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Flag className="h-4 w-4" />
                                <span>{course.holes} holes</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <span>Par {coursePar(course)}</span>
                              </div>
                              
                              {location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="truncate">{location}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              <span className={open ? "text-green-600 font-medium" : "text-muted-foreground"}>
                                {open ? "Open now" : formatOpeningHours(course.opening_hours)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {t("addRound", "noCoursesFound")}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseSearch;
