
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";

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
  const navigate = useNavigate();

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

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Full screen map */}
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-green-50">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="h-full w-full relative bg-gradient-to-br from-green-100 via-green-200 to-green-300">
            {/* Embedded Google Map */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d13135.91!2d-58.3816!3d-34.6118!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sgolf%20courses%20buenos%20aires!5e0!3m2!1sen!2sar!4v1699999999999!5m2!1sen!2sar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
            
            {/* Course markers overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {courses && courses.length > 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {courses.slice(0, 8).map((course, index) => (
                    <div 
                      key={course.id}
                      className="absolute pointer-events-auto cursor-pointer"
                      style={{
                        left: `${(index % 4) * 80 - 120}px`,
                        top: `${Math.floor(index / 4) * 60 - 30}px`
                      }}
                      onClick={() => handleMarkerClick(course)}
                    >
                      <div className="w-8 h-8 bg-green-600 rounded-full shadow-lg border-2 border-white flex items-center justify-center hover:bg-green-700 transition-colors">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      
                      {/* Course name tooltip */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                        {course.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {courses && courses.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                  <CardContent className="text-center p-6">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No golf courses found in this area.</p>
                  </CardContent>
                </Card>
              </div>
            )}
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
