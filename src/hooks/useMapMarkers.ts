
import { useRef, useCallback } from "react";
import { createMarkerElement, validateCoordinates, fitMapToBounds } from "@/utils/mapMarkers";

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

export const useMapMarkers = (onCourseSelect: (course: GolfCourse) => void) => {
  const markersRef = useRef<any[]>([]);
  const coursesRef = useRef<GolfCourse[]>([]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (e) {
        console.warn("Error removing marker:", e);
      }
    });
    markersRef.current = [];
  }, []);

  const addMarkersToMap = useCallback((mapInstance: any, coursesToAdd: GolfCourse[], shouldFitBounds = false) => {
    console.log("[MapMarkers] Adding markers for", coursesToAdd.length, "courses");

    // Clear existing markers first
    clearMarkers();

    const bounds = new (window as any).mapboxgl.LngLatBounds();
    let validCourses = 0;

    coursesToAdd.forEach(course => {
      const lat = Number(course.latitude);
      const lng = Number(course.longitude);
      
      if (!validateCoordinates(course.latitude, course.longitude)) {
        console.warn(`Course ${course.name} has invalid coordinates:`, { 
          lat: course.latitude, 
          lng: course.longitude 
        });
        return;
      }
      
      validCourses++;
      
      const el = createMarkerElement(course, onCourseSelect);
      const coordinates: [number, number] = [lng, lat];
      
      console.log(`Adding marker for ${course.name} at [${lng}, ${lat}]`);

      // Create marker with proper positioning
      const marker = new (window as any).mapboxgl.Marker({
        element: el,
        anchor: "center"
      })
        .setLngLat(coordinates)
        .addTo(mapInstance);

      markersRef.current.push(marker);
      bounds.extend(coordinates);
    });

    console.log("[MapMarkers] Added", validCourses, "valid markers");

    // Fit bounds only when explicitly requested
    if (shouldFitBounds && validCourses > 0) {
      fitMapToBounds(mapInstance, bounds, validCourses);
    }

    // Update courses reference
    coursesRef.current = coursesToAdd;
  }, [onCourseSelect, clearMarkers]);

  const cleanup = useCallback(() => {
    clearMarkers();
    coursesRef.current = [];
  }, [clearMarkers]);

  return {
    addMarkersToMap,
    clearMarkers,
    cleanup,
    coursesRef
  };
};
