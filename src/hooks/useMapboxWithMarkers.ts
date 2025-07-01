
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
  const mapReadyRef = useRef(false);
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
      mapReadyRef.current = true;
    }
  });

  // Handle courses and map initialization first
  useEffect(() => {
    if (!map || !courses || courses.length === 0 || isLoading || !mapReadyRef.current) return;

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

  // Handle focus course functionality - runs after markers are initialized
  useEffect(() => {
    if (!map || !focusCourseId || !courses || courses.length === 0 || 
        isLoading || !markersInitialized || !mapReadyRef.current) {
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
      
      // Ensure map is ready and then fly to course with smooth animation
      const focusTimeout = setTimeout(() => {
        if (map.isStyleLoaded()) {
          console.log("[MapboxWithMarkers] Flying to course location with animation");
          
          // First fly to the course location with a smooth animation
          map.flyTo({
            center: [courseToFocus.longitude!, courseToFocus.latitude!],
            zoom: 16,
            essential: true,
            duration: 2500,
            curve: 1.2, // Makes the flight path more curved for better visual effect
            easing: (t) => t * (2 - t) // Smooth easing function
          });
          
          // Auto-select the focused course after the animation completes
          setTimeout(() => {
            console.log("[MapboxWithMarkers] Auto-selecting focused course");
            onCourseSelect(courseToFocus);
          }, 3000); // Wait for fly animation to complete
        }
      }, 500); // Small delay to ensure everything is ready
      
      return () => clearTimeout(focusTimeout);
    }
  }, [map, focusCourseId, courses, isLoading, onCourseSelect, markersInitialized]);

  // Reset focus handler when focusCourseId changes
  useEffect(() => {
    if (focusCourseId !== focusHandledRef.current) {
      focusHandledRef.current = null;
    }
  }, [focusCourseId]);

  return {
    map,
    isLoading,
    error,
    cleanup
  };
};
