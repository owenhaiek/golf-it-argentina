
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";
import { CourseMarker } from "@/components/map/CourseMarker";
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
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
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

  // Calculate map center based on courses
  const mapCenter = courses?.length > 0 
    ? {
        lat: courses.reduce((sum, course) => sum + (course.latitude || 0), 0) / courses.length,
        lng: courses.reduce((sum, course) => sum + (course.longitude || 0), 0) / courses.length
      }
    : { lat: -34.6118, lng: -58.3816 }; // Default to Buenos Aires

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
            {/* Embedded Google Map with dynamic center */}
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d13135.91!2d${mapCenter.lng}!3d${mapCenter.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sar!4v1699999999999!5m2!1sen!2sar`}
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
                <>
                  {courses.map((course) => {
                    if (!course.latitude || !course.longitude) return null;
                    
                    // Calculate position relative to map bounds (this is a simplified approach)
                    // In a real implementation, you'd use proper map projection calculations
                    const normalizedLat = ((course.latitude - (mapCenter.lat - 0.1)) / 0.2) * 100;
                    const normalizedLng = ((course.longitude - (mapCenter.lng - 0.1)) / 0.2) * 100;
                    
                    // Only show markers that would be visible on the map
                    if (normalizedLat < 0 || normalizedLat > 100 || normalizedLng < 0 || normalizedLng > 100) {
                      return null;
                    }
                    
                    return (
                      <div 
                        key={course.id}
                        className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{
                          left: `${normalizedLng}%`,
                          top: `${normalizedLat}%`
                        }}
                      >
                        <CourseMarker 
                          course={course} 
                          onClick={handleMarkerClick}
                        />
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {courses && courses.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                  <CardContent className="text-center p-6">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No golf courses found with location data.</p>
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
