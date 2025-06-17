
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

  const clearMarkers = useCallback(() => {
    if (markersRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        try {
          if (marker && typeof marker.remove === 'function') {
            marker.remove();
          }
        } catch (e) {
          console.warn("Error removing marker:", e);
        }
      });
    }
    markersRef.current = [];
  }, []);

  const addMarkersToMap = useCallback((mapInstance: any, coursesToAdd: GolfCourse[], shouldFitBounds = false) => {
    console.log("[MapMarkers] Adding markers for", coursesToAdd.length, "courses");

    // Clear existing markers first
    clearMarkers();

    if (!coursesToAdd || coursesToAdd.length === 0) {
      console.log("[MapMarkers] No courses to add markers for");
      return;
    }

    const bounds = new (window as any).mapboxgl.LngLatBounds();
    let validCourses = 0;

    coursesToAdd.forEach(course => {
      if (!validateCoordinates(course.latitude, course.longitude)) {
        console.warn(`Course ${course.name} has invalid coordinates:`, { 
          lat: course.latitude, 
          lng: course.longitude 
        });
        return;
      }
      
      const lat = Number(course.latitude);
      const lng = Number(course.longitude);
      validCourses++;
      
      const el = createMarkerElement(course, onCourseSelect);
      const coordinates: [number, number] = [lng, lat];
      
      console.log(`Adding marker for ${course.name} at [${lng}, ${lat}]`);

      try {
        const marker = new (window as any).mapboxgl.Marker({
          element: el,
          anchor: "center"
        })
          .setLngLat(coordinates)
          .addTo(mapInstance);

        markersRef.current.push(marker);
        bounds.extend(coordinates);
      } catch (error) {
        console.warn(`Failed to add marker for ${course.name}:`, error);
      }
    });

    console.log("[MapMarkers] Added", validCourses, "valid markers");

    // Only fit bounds on initial load and if we have valid courses
    if (shouldFitBounds && validCourses > 0) {
      setTimeout(() => {
        fitMapToBounds(mapInstance, bounds, validCourses);
      }, 300);
    }
  }, [onCourseSelect, clearMarkers]);

  const cleanup = useCallback(() => {
    clearMarkers();
  }, [clearMarkers]);

  return {
    addMarkersToMap,
    clearMarkers,
    cleanup
  };
};
