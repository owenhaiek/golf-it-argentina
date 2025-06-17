
import { useRef, useState, useEffect } from "react";
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
}

export const useMapboxWithMarkers = ({
  containerRef,
  center = [-58.3816, -34.6118],
  zoom = 6,
  accessToken,
  courses,
  onCourseSelect
}: UseMapboxWithMarkersOptions) => {
  const [markersAdded, setMarkersAdded] = useState(false);
  const { addMarkersToMap, cleanup, coursesRef } = useMapMarkers(onCourseSelect);

  const { map, isLoading, error } = useSimpleMapbox({
    containerRef,
    center,
    zoom,
    accessToken,
    onMapReady: (mapInstance) => {
      console.log("[MapboxWithMarkers] Map ready, adding markers");
      
      // Add markers only once when map is ready and we have courses
      if (courses && courses.length > 0 && !markersAdded) {
        // Wait for map to be fully loaded before adding markers
        mapInstance.on('idle', () => {
          if (!markersAdded) {
            addMarkersToMap(mapInstance, courses, true);
            setMarkersAdded(true);
          }
        });
      }
    }
  });

  // Handle courses changes - only update if courses actually changed
  useEffect(() => {
    if (!map || !courses || markersAdded) return;

    const coursesChanged = courses.length !== coursesRef.current.length || 
      courses.some((course, index) => course.id !== coursesRef.current[index]?.id);

    if (coursesChanged && map.isStyleLoaded()) {
      addMarkersToMap(map, courses, true);
      setMarkersAdded(true);
    }
  }, [courses, map, addMarkersToMap, markersAdded, coursesRef]);

  return {
    map,
    isLoading,
    error,
    cleanup
  };
};
