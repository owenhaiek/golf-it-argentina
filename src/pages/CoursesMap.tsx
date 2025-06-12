
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";
import { CourseMarker } from "@/components/map/CourseMarker";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface GolfCourse {
  id: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  website?: string;
  opening_hours?: any;
  hole_pars?: number[];
  hole_handicaps?: number[];
  image_gallery?: string;
  established_year?: number;
  type?: string;
}

const CoursesMap = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const handleMarkerClick = (course: GolfCourse) => {
    setSelectedCourse(course);
  };

  return (
    <div className="h-screen relative">
      {/* Full screen map background */}
      <div className="absolute inset-0 bg-green-100">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="h-full w-full relative">
            {/* Simple map representation with course markers */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-300">
              {courses && courses.length > 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {courses.slice(0, 5).map((course, index) => (
                    <div 
                      key={course.id}
                      className="absolute"
                      style={{
                        left: `${index * 60 - 120}px`,
                        top: `${(index % 2) * 40 - 20}px`
                      }}
                    >
                      <CourseMarker course={course} onClick={handleMarkerClick} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {courses && courses.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <Card className="max-w-md mx-auto">
                  <CardContent className="text-center p-6">
                    No courses found.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Course info slide-down tab */}
      {selectedCourse && (
        <CourseInfoTab 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)} 
          isOpen={!!selectedCourse} 
        />
      )}
    </div>
  );
};

export default CoursesMap;
