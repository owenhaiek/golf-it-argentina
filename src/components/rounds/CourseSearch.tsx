
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Clock } from "lucide-react";
import { isCurrentlyOpen, formatOpeningHours } from "@/utils/openingHours";
import { useLanguage } from "@/contexts/LanguageContext";

interface Course {
  id: string;
  name: string;
  holes: number;
  hole_pars: number[];
  opening_hours?: any;
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
  const [showCourses, setShowCourses] = useState(false);
  const { t } = useLanguage();

  const selectedCourseData = courses?.find(course => course.id === selectedCourse);

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show courses only when searching
  useEffect(() => {
    if (searchQuery === "" && !showCourses) return;
    setShowCourses(searchQuery.length > 0);
  }, [searchQuery]);

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
        {showCourses && filteredCourses.length > 0 && (
          <div className="max-h-[200px] overflow-y-auto space-y-2">
            {filteredCourses.map((course) => {
              const coursePar = course.hole_pars
                ?.slice(0, course.holes)
                .reduce((a, b) => a + (b || 0), 0) || 0;
              
              const open = isCurrentlyOpen(course.opening_hours);
              
              return (
                <Button
                  key={course.id}
                  variant={selectedCourse === course.id ? "default" : "outline"}
                  className="w-full justify-between flex-col items-start p-3 h-auto"
                  onClick={() => {
                    onSelectCourse(course.id);
                    setSearchQuery("");
                    setShowCourses(false);
                  }}
                >
                  <div className="flex justify-between w-full">
                    <span className="font-semibold">{course.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {t("addRound", "par")} {coursePar}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    <Clock className="h-3 w-3" />
                    <span className={open ? "text-green-500" : "text-muted-foreground"}>
                      {open ? t("addRound", "openNow") : formatOpeningHours(course.opening_hours)}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
        {showCourses && filteredCourses.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            {t("addRound", "noCoursesFound")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseSearch;
