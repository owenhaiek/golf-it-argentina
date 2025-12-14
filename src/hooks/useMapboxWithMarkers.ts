import { useState, useEffect, useRef, useCallback } from "react";
import { useSimpleMapbox } from "@/hooks/useSimpleMapbox";
import { useClusteredMarkers } from "@/hooks/useClusteredMarkers";

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
  
  const { setupClusterLayers, focusOnCourse, cleanup: cleanupClusters } = useClusteredMarkers(onCourseSelect);

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
      
      // Listen for style changes to re-setup clusters
      mapInstance.on('style.load', () => {
        console.log("[MapboxWithMarkers] Style loaded, re-setting up clusters");
        setTimeout(() => {
          if (coursesRef.current && coursesRef.current.length > 0) {
            setupClusterLayers(mapInstance, coursesRef.current);
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

  // Initialize clusters when map and courses are ready
  useEffect(() => {
    if (!map || !courses || courses.length === 0 || isLoading || !isInitialized) {
      return;
    }

    console.log("[MapboxWithMarkers] Initializing clusters for", courses.length, "courses");
    setupClusterLayers(map, courses);
    
  }, [map, courses, isLoading, isInitialized, setupClusterLayers]);

  // Handle course focus - separate effect with simpler logic
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
    
    // Focus with proper timing
    setTimeout(() => {
      focusOnCourse(map, courseToFocus, () => {
        console.log("[MapboxWithMarkers] Focus complete, selecting course");
        onCourseSelect(courseToFocus);
      });
    }, 600);

  }, [map, focusCourseId, courses, isInitialized, isLoading, focusOnCourse, onCourseSelect]);

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

  const cleanup = useCallback(() => {
    if (map) {
      cleanupClusters(map);
    }
  }, [map, cleanupClusters]);

  return {
    map,
    isLoading,
    error,
    cleanup
  };
};
