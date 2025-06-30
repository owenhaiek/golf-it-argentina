
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
  
  // Get courseId from URL parameters
  const courseIdFromUrl = searchParams.get('courseId');

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

  // Auto-select course if courseId is provided in URL
  useEffect(() => {
    if (courseIdFromUrl && courses && courses.length > 0) {
      const courseToSelect = courses.find(course => course.id === courseIdFromUrl);
      if (courseToSelect) {
        console.log("[CoursesMap] Auto-selecting course from URL:", courseToSelect.name);
        setSelectedCourse(courseToSelect);
      }
    }
  }, [courseIdFromUrl, courses]);

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
          focusCourseId={courseIdFromUrl}
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
