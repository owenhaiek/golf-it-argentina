
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
  const [markersInitialized, setMarkersInitialized] = useState(false);
  const coursesVersionRef = useRef<string>('');
  const focusHandledRef = useRef<string | null>(null);
  const { addMarkersToMap, cleanup } = useMapMarkers(onCourseSelect);

  const { map, isLoading, error } = useSimpleMapbox({
    containerRef,
    center,
    zoom,
    accessToken,
    onMapReady: (mapInstance) => {
      console.log("[MapboxWithMarkers] Map ready, setting Argentina bounds");
      
      // Set tighter bounds focused on main Argentina populated areas
      const argentinaBounds = [
        [-68.5605, -45.0610], // Southwest coordinates (more focused)
        [-55.6374, -25.7810]  // Northeast coordinates (more focused)
      ];
      
      mapInstance.setMaxBounds(argentinaBounds);
    }
  });

  // Handle focus course functionality - this runs after map and courses are ready
  useEffect(() => {
    if (!map || !focusCourseId || !courses || courses.length === 0 || isLoading) {
      return;
    }

    // Prevent handling the same focus course multiple times
    if (focusHandledRef.current === focusCourseId) {
      return;
    }

    const courseToFocus = courses.find(course => course.id === focusCourseId);
    if (courseToFocus && courseToFocus.latitude && courseToFocus.longitude) {
      console.log("[MapboxWithMarkers] Focusing on course:", courseToFocus.name, "at coordinates:", [courseToFocus.longitude, courseToFocus.latitude]);
      
      // Mark this focus as handled
      focusHandledRef.current = focusCourseId;
      
      // Wait for map to be fully ready and markers to be added, then fly to the course location
      const focusTimeout = setTimeout(() => {
        if (map.isStyleLoaded()) {
          console.log("[MapboxWithMarkers] Flying to course location");
          map.flyTo({
            center: [courseToFocus.longitude!, courseToFocus.latitude!],
            zoom: 15,
            essential: true,
            duration: 2000
          });
          
          // Auto-select the focused course after flying to it
          setTimeout(() => {
            onCourseSelect(courseToFocus);
          }, 2500);
        }
      }, 1500); // Increased delay to ensure markers are added first
      
      return () => clearTimeout(focusTimeout);
    }
  }, [map, focusCourseId, courses, isLoading, onCourseSelect, markersInitialized]);

  // Reset focus handler when focusCourseId changes
  useEffect(() => {
    if (focusCourseId !== focusHandledRef.current) {
      focusHandledRef.current = null;
    }
  }, [focusCourseId]);

  // Handle courses and map initialization
  useEffect(() => {
    if (!map || !courses || courses.length === 0 || isLoading) return;

    // Create a version string to detect actual course changes
    const currentVersion = courses
      .filter(c => c.latitude && c.longitude)
      .map(c => `${c.id}-${c.latitude}-${c.longitude}`)
      .sort()
      .join('|');
    
    // Only add markers if courses actually changed or haven't been initialized
    if (!markersInitialized || currentVersion !== coursesVersionRef.current) {
      console.log("[MapboxWithMarkers] Adding markers for", courses.length, "courses");
      
      // Wait for map to be fully loaded
      if (map.isStyleLoaded()) {
        addMarkersToMap(map, courses, !markersInitialized);
        setMarkersInitialized(true);
        coursesVersionRef.current = currentVersion;
      } else {
        // Wait for style to load
        const handleStyleLoad = () => {
          addMarkersToMap(map, courses, !markersInitialized);
          setMarkersInitialized(true);
          coursesVersionRef.current = currentVersion;
          map.off('style.load', handleStyleLoad);
        };
        map.on('style.load', handleStyleLoad);
      }
    }
  }, [map, courses, addMarkersToMap, markersInitialized, isLoading]);

  return {
    map,
    isLoading,
    error,
    cleanup
  };
};
