
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";
import { MapContainer } from "@/components/map/MapContainer";
import { MapErrorState } from "@/components/map/MapErrorState";
import { MapLoadingState } from "@/components/map/MapLoadingState";
import { MapEmptyState } from "@/components/map/MapEmptyState";
import { MapSearchOverlay } from "@/components/map/MapSearchOverlay";

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
  const mapRef = React.useRef<any>(null);

  // Handle course selection - center map on course
  const handleCourseSelect = React.useCallback((course: GolfCourse) => {
    setSelectedCourse(course);
    
    // Center map on selected course with a slight delay to ensure map is ready
    setTimeout(() => {
      if (mapRef.current && course.latitude && course.longitude) {
        mapRef.current.flyTo({
          center: [Number(course.longitude), Number(course.latitude)],
          zoom: 15,
          duration: 1200,
          essential: true
        });
      }
    }, 100);
  }, []);

  // Handle search result selection
  const handleSearchSelect = React.useCallback((course: GolfCourse) => {
    handleCourseSelect(course);
  }, [handleCourseSelect]);

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
        handleCourseSelect(courseToFocus);
      }
    }
  }, [focusCourseId, courses, handleCourseSelect]);

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
          onCourseSelect={handleCourseSelect}
          focusCourseId={focusCourseId}
          onMapReady={(map) => { mapRef.current = map; }}
        />
        
        {/* Empty state */}
        {courses && courses.length === 0 && <MapEmptyState />}
      </div>
      
      {/* Search overlay */}
      <MapSearchOverlay 
        courses={courses || []}
        onSelectCourse={handleSearchSelect}
      />
      
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
