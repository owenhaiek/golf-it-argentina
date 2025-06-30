
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";
import { MapContainer } from "@/components/map/MapContainer";
import { MapErrorState } from "@/components/map/MapErrorState";
import { MapLoadingState } from "@/components/map/MapLoadingState";
import { MapEmptyState } from "@/components/map/MapEmptyState";

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
}

const CoursesMap = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [searchParams] = useSearchParams();
  const focusCourseId = searchParams.get('focus');

  // Fetch courses data
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['courses-map'],
    queryFn: async () => {
      console.log("[CoursesMap] Fetching courses...");
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('name');
      if (error) throw error;
      console.log("[CoursesMap] Courses loaded:", data?.length || 0);
      return data || [];
    }
  });

  // Handle focus course from URL parameter
  useEffect(() => {
    if (focusCourseId && courses && courses.length > 0) {
      const courseToFocus = courses.find(course => course.id === focusCourseId);
      if (courseToFocus) {
        console.log("[CoursesMap] Auto-selecting course from URL:", courseToFocus.name);
        setSelectedCourse(courseToFocus);
      }
    }
  }, [focusCourseId, courses]);

  const handleRetry = () => {
    window.location.reload();
  };

  // Error state
  if (coursesError) {
    return (
      <MapErrorState 
        coursesError={coursesError} 
        onRetry={handleRetry} 
      />
    );
  }

  // Loading state
  if (coursesLoading) {
    return (
      <MapLoadingState 
        coursesLoading={coursesLoading} 
        mapLoading={false} 
      />
    );
  }

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Map container */}
      <div className="absolute inset-0 bg-gray-200">
        <MapContainer 
          courses={courses || []}
          onCourseSelect={setSelectedCourse}
          focusCourseId={focusCourseId}
        />
        
        {/* Empty state */}
        {courses && courses.length === 0 && <MapEmptyState />}
      </div>
      
      {/* Course info tab */}
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
