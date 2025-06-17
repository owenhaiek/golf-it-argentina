
import { useRef, useState } from "react";
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
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const { addMarkersToMap, cleanup, coursesRef } = useMapMarkers(onCourseSelect);

  const { map, isLoading, error } = useSimpleMapbox({
    containerRef,
    center,
    zoom,
    accessToken,
    onMapReady: (mapInstance) => {
      console.log("[MapboxWithMarkers] Map ready");
      
      mapInstance.on('idle', () => {
        if (courses && courses.length > 0 && !hasInitialLoad) {
          addMarkersToMap(mapInstance, courses, true);
          setHasInitialLoad(true);
        }
      });
    }
  });

  const updateMarkers = (newCourses: GolfCourse[]) => {
    if (!map || !newCourses) return;

    const coursesChanged = newCourses.length !== coursesRef.current.length || 
      newCourses.some((course, index) => course.id !== coursesRef.current[index]?.id);

    if (coursesChanged && map.isStyleLoaded()) {
      addMarkersToMap(map, newCourses, false);
    }
  };

  return {
    map,
    isLoading,
    error,
    updateMarkers,
    cleanup
  };
};
