
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
  focusCourse?: GolfCourse | null;
}

export const useMapboxWithMarkers = ({
  containerRef,
  center = [-58.3816, -34.6118],
  zoom = 6,
  accessToken,
  courses,
  onCourseSelect,
  focusCourse
}: UseMapboxWithMarkersOptions) => {
  const [markersInitialized, setMarkersInitialized] = useState(false);
  const coursesVersionRef = useRef<string>('');
  const { addMarkersToMap, cleanup } = useMapMarkers(onCourseSelect);

  const { map, isLoading, error } = useSimpleMapbox({
    containerRef,
    center,
    zoom,
    accessToken,
    onMapReady: (mapInstance) => {
      console.log("[MapboxWithMarkers] Map ready, setting Argentina bounds");
      
      // Set bounds to keep focus on Argentina and prevent unwanted zooming
      const argentinaBounds = [
        [-73.5605, -55.0610], // Southwest coordinates
        [-53.6374, -21.7810]  // Northeast coordinates
      ];
      
      mapInstance.setMaxBounds(argentinaBounds);
      
      // If there's a focus course, center on it
      if (focusCourse && focusCourse.latitude && focusCourse.longitude) {
        console.log("[MapboxWithMarkers] Focusing on course:", focusCourse.name);
        mapInstance.flyTo({
          center: [focusCourse.longitude, focusCourse.latitude],
          zoom: 14,
          essential: true,
          duration: 1500
        });
      } else {
        // Ensure map stays centered on Argentina
        mapInstance.flyTo({
          center: [-58.3816, -34.6118],
          zoom: 6,
          essential: true,
          duration: 1000
        });
      }
    }
  });

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
