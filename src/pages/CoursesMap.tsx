import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer } from "@/components/map/MapContainer";
import { MapSearchOverlay } from "@/components/map/MapSearchOverlay";
import { MapActionMenu } from "@/components/map/MapActionMenu";
import { MapLoadingState } from "@/components/map/MapLoadingState";
import { MapErrorState } from "@/components/map/MapErrorState";
import { MapEmptyState } from "@/components/map/MapEmptyState";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";

interface GolfCourse {
  id: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  description?: string;
  image_url?: string;
  image_gallery?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  website?: string;
}

const CoursesMap = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [hasEntryAnimated, setHasEntryAnimated] = useState(false);
  const mapRef = useRef<any>(null);
  const [searchParams] = useSearchParams();

  const handleCourseSelect = (course: GolfCourse) => {
    // Prevent re-selecting the same course (fixes reopening issue)
    if (selectedCourse?.id === course.id) {
      return;
    }
    
    setSelectedCourse(course);
    
    // Center map on course
    if (mapRef.current && course.latitude && course.longitude) {
      mapRef.current.flyTo({
        center: [course.longitude, course.latitude],
        zoom: 14,
        duration: 1500,
        essential: true
      });
    }
  };

  const handleCloseInfoTab = () => {
    setSelectedCourse(null);
  };

  const handleSearchSelect = (course: GolfCourse) => {
    handleCourseSelect(course);
  };

  // Fetch golf courses
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['golf-courses-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('id, name, city, state, par, holes, description, image_url, image_gallery, latitude, longitude, address, phone, website')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      if (error) throw error;
      return (data || []) as GolfCourse[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => setHasEntryAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-focus on course from URL param
  useEffect(() => {
    const focusCourseId = searchParams.get('focus');
    if (focusCourseId && courses.length > 0) {
      const courseToFocus = courses.find(c => c.id === focusCourseId);
      if (courseToFocus) {
        setTimeout(() => handleCourseSelect(courseToFocus), 500);
      }
    }
  }, [courses, searchParams]);

  if (error) {
    return <MapErrorState onRetry={() => window.location.reload()} />;
  }

  if (isLoading) {
    return <MapLoadingState coursesLoading={true} mapLoading={true} />;
  }

  return (
    <motion.div 
      className="relative w-full h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: hasEntryAnimated ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Map */}
      <MapContainer 
        courses={courses}
        onCourseSelect={handleCourseSelect}
        focusCourseId={selectedCourse?.id}
        onMapReady={(map) => { mapRef.current = map; }}
      />
      
      {/* Empty state overlay */}
      {courses.length === 0 && <MapEmptyState />}
      
      {/* Search overlay with profile button */}
      <MapSearchOverlay 
        courses={courses}
        onSelectCourse={handleSearchSelect}
      />
      
      {/* Action menu (bottom right) */}
      <MapActionMenu />
      
      {/* Course info tab (bottom sheet) */}
      <CourseInfoTab 
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={handleCloseInfoTab}
      />
    </motion.div>
  );
};

export default CoursesMap;
