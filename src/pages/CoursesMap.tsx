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
import { MapActionMenu } from "@/components/map/MapActionMenu";
import { resetActiveMarker, setActiveMarker } from "@/utils/mapMarkers";

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
    setActiveMarker(course.id);
    
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

  // Handle closing the info tab
  const handleCloseInfoTab = React.useCallback(() => {
    setSelectedCourse(null);
    resetActiveMarker();
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
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      {/* Map container - full screen */}
      <div className="absolute inset-0">
        <MapContainer 
          courses={courses || []}
          onCourseSelect={handleCourseSelect}
          focusCourseId={focusCourseId}
          onMapReady={(map) => { mapRef.current = map; }}
        />
        
        {/* Empty state */}
        {courses && courses.length === 0 && <MapEmptyState />}
      </div>
      
      {/* App logo - bottom left */}
      <div className="absolute bottom-6 left-4 z-10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg bg-background/80 backdrop-blur-sm border border-border/50">
          <img 
            src="/lovable-uploads/c4b5d185-bd84-43f5-8ec7-4de4b18ca81c.png" 
            alt="Golfit Logo" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Search overlay */}
      <MapSearchOverlay 
        courses={courses || []}
        onSelectCourse={handleSearchSelect}
      />
      
      {/* Action menu (Add round, tournament, match) */}
      <MapActionMenu />
      
      {/* Course info tab */}
      {selectedCourse && (
        <CourseInfoTab 
          course={selectedCourse}
          onClose={handleCloseInfoTab}
          isOpen={!!selectedCourse}
        />
      )}
    </div>
  );
};

export default CoursesMap;
