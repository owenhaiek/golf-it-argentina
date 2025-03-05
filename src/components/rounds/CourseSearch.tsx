
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface Course {
  id: string;
  name: string;
  holes: number;
  hole_pars: number[];
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
        <CardTitle>Select Course</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a course..."
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
              return (
                <Button
                  key={course.id}
                  variant={selectedCourse === course.id ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => {
                    onSelectCourse(course.id);
                    setSearchQuery("");
                    setShowCourses(false);
                  }}
                >
                  <span>{course.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Par {coursePar}
                  </span>
                </Button>
              );
            })}
          </div>
        )}
        {showCourses && filteredCourses.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No courses found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseSearch;
