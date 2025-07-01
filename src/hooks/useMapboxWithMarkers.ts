
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
      setMarkersLoaded(true);
    } else {
      const handleStyleLoad = () => {
        addMarkersToMap(map, courses, !markersLoaded);
        setMarkersLoaded(true);
        map.off('style.load', handleStyleLoad);
      };
      map.on('style.load', handleStyleLoad);
    }
  }, [map, courses, addMarkersToMap, markersLoaded, isLoading]);

  // Handle course focus separately and simply
  useEffect(() => {
    if (!map || !focusCourseId || !courses || courses.length === 0 || 
        !markersLoaded || isLoading) {
      return;
    }

    const courseToFocus = courses.find(course => course.id === focusCourseId);
    if (courseToFocus && courseToFocus.latitude && courseToFocus.longitude) {
      console.log("[MapboxWithMarkers] Focusing on course from URL:", courseToFocus.name);
      
      // Small delay to ensure markers are rendered
      setTimeout(() => {
        focusOnCourse(map, courseToFocus, () => {
          console.log("[MapboxWithMarkers] Focus complete, selecting course");
          onCourseSelect(courseToFocus);
        });
      }, 500);
    }
  }, [map, focusCourseId, courses, markersLoaded, isLoading, focusOnCourse, onCourseSelect]);

  return {
    map,
    isLoading,
    error,
    cleanup
  };
};
