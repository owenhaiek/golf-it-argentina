import { useState, useEffect, useRef, useCallback } from "react";
import { useSimpleMapbox } from "@/hooks/useSimpleMapbox";
import { useMapMarkers } from "@/hooks/useMapMarkers";

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

interface UseMapboxWithMarkersOptions {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
  courses: GolfCourse[];
  onCourseSelect: (course: GolfCourse) => void;
  focusCourseId?: string | null;
  mapStyle?: 'satellite' | 'street' | 'dark';
}

export const useMapboxWithMarkers = ({
  containerRef,
  center = [-58.3816, -34.6118],
  zoom = 4,
  accessToken,
  courses,
  onCourseSelect,
  focusCourseId,
  mapStyle = 'dark'
}: UseMapboxWithMarkersOptions) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const hasFocusedRef = useRef<string | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const coursesRef = useRef<GolfCourse[]>(courses);
  
  const { addMarkersToMap, focusOnCourse, cleanup: cleanupMarkers, clearMarkers } = useMapMarkers(onCourseSelect);

  // Keep courses ref updated
  useEffect(() => {
    coursesRef.current = courses;
  }, [courses]);

  const { map, isLoading, error } = useSimpleMapbox({
    containerRef,
    center,
    zoom,
    accessToken,
    mapStyle,
    onMapReady: (mapInstance) => {
      console.log("[MapboxWithMarkers] Map ready");
      
      // Listen for style changes to re-add markers
      mapInstance.on('style.load', () => {
        console.log("[MapboxWithMarkers] Style loaded, re-adding markers");
        setTimeout(() => {
          if (coursesRef.current && coursesRef.current.length > 0) {
            addMarkersToMap(mapInstance, coursesRef.current, false);
          }
        }, 100);
      });
      
      // Mark as initialized after a short delay
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      
      initTimeoutRef.current = setTimeout(() => {
        setIsInitialized(true);
      }, 300);
    }
  });

  // Initialize markers when map and courses are ready
  useEffect(() => {
    if (!map || !courses || courses.length === 0 || isLoading || !isInitialized) {
      return;
    }

    console.log("[MapboxWithMarkers] Initializing markers for", courses.length, "courses");
    const shouldFitBounds = !focusCourseId;
    addMarkersToMap(map, courses, shouldFitBounds);
    
  }, [map, courses, isLoading, isInitialized, addMarkersToMap, focusCourseId]);

  // Handle course focus - only for URL-based focus (not marker clicks)
  useEffect(() => {
    if (!map || !focusCourseId || !courses || courses.length === 0 || 
        !isInitialized || isLoading) {
      return;
    }

    // Prevent duplicate focus on same course
    if (hasFocusedRef.current === focusCourseId) {
      return;
    }

    const courseToFocus = courses.find(course => course.id === focusCourseId);
    if (!courseToFocus || !courseToFocus.latitude || !courseToFocus.longitude) {
      console.warn("[MapboxWithMarkers] Course not found or missing coordinates:", focusCourseId);
      return;
    }

    console.log("[MapboxWithMarkers] Focusing on course:", courseToFocus.name);
    
    // Mark this course as focused to prevent duplicates
    hasFocusedRef.current = focusCourseId;
    
    // Just focus on the course, don't re-select (marker click already selected it)
    focusOnCourse(map, courseToFocus);

  }, [map, focusCourseId, courses, isInitialized, isLoading, focusOnCourse]);

  // Reset focus tracking when focusCourseId changes
  useEffect(() => {
    if (!focusCourseId) {
      hasFocusedRef.current = null;
    }
  }, [focusCourseId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  return {
    map,
    isLoading,
    error,
    cleanup: cleanupMarkers
  };
};
