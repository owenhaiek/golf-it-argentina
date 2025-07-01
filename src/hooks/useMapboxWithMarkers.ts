
import { useState, useEffect, useRef } from "react";
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
}

export const useMapboxWithMarkers = ({
  containerRef,
  center = [-58.3816, -34.6118],
  zoom = 4,
  accessToken,
  courses,
  onCourseSelect,
  focusCourseId
}: UseMapboxWithMarkersOptions) => {
  const [markersLoaded, setMarkersLoaded] = useState(false);
  const [focusHandled, setFocusHandled] = useState(false);
  const focusTimeoutRef = useRef<NodeJS.Timeout>();
  const { addMarkersToMap, focusOnCourse, cleanup } = useMapMarkers(onCourseSelect);

  const { map, isLoading, error } = useSimpleMapbox({
    containerRef,
    center,
    zoom,
    accessToken,
    onMapReady: (mapInstance) => {
      console.log("[MapboxWithMarkers] Map ready, setting Argentina bounds");
      
      // Set Argentina bounds
      const argentinaBounds = [
        [-68.5605, -45.0610], // Southwest coordinates
        [-55.6374, -25.7810]  // Northeast coordinates
      ];
      
      mapInstance.setMaxBounds(argentinaBounds);
    }
  });

  // Load markers when map and courses are ready
  useEffect(() => {
    if (!map || !courses || courses.length === 0 || isLoading) {
      return;
    }

    console.log("[MapboxWithMarkers] Loading markers for", courses.length, "courses");
    
    // Wait for map to be fully loaded
    if (map.isStyleLoaded()) {
      addMarkersToMap(map, courses, !markersLoaded);
      if (!markersLoaded) {
        setMarkersLoaded(true);
      }
    } else {
      const handleStyleLoad = () => {
        addMarkersToMap(map, courses, !markersLoaded);
        if (!markersLoaded) {
          setMarkersLoaded(true);
        }
        map.off('style.load', handleStyleLoad);
      };
      map.on('style.load', handleStyleLoad);
    }
  }, [map, courses, addMarkersToMap, markersLoaded, isLoading]);

  // Handle course focus from URL parameter - only once when everything is ready
  useEffect(() => {
    // Clear any existing timeout
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }

    // Reset focus handled when focusCourseId changes
    if (focusCourseId && !focusHandled) {
      setFocusHandled(false);
    }

    // Only proceed if we have all required conditions and haven't handled this focus yet
    if (!map || !focusCourseId || !courses || courses.length === 0 || 
        !markersLoaded || isLoading || focusHandled) {
      return;
    }

    const courseToFocus = courses.find(course => course.id === focusCourseId);
    if (!courseToFocus || !courseToFocus.latitude || !courseToFocus.longitude) {
      console.warn("[MapboxWithMarkers] Course not found or missing coordinates:", focusCourseId);
      return;
    }

    console.log("[MapboxWithMarkers] Focusing on course from URL:", courseToFocus.name);
    
    // Mark as handled immediately to prevent duplicates
    setFocusHandled(true);
    
    // Focus with a delay to ensure markers are visible
    focusTimeoutRef.current = setTimeout(() => {
      focusOnCourse(map, courseToFocus, () => {
        console.log("[MapboxWithMarkers] Focus complete, selecting course");
        onCourseSelect(courseToFocus);
      });
    }, 800);

  }, [map, focusCourseId, courses, markersLoaded, isLoading, focusHandled, focusOnCourse, onCourseSelect]);

  // Reset focus handled when focusCourseId changes
  useEffect(() => {
    setFocusHandled(false);
  }, [focusCourseId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  return {
    map,
    isLoading,
    error,
    cleanup
  };
};
