
import { useRef, useCallback } from "react";
import { createMarkerElement, validateCoordinates } from "@/utils/mapMarkers";

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
    markersRef.current.forEach(marker => {
      try {
        if (marker && typeof marker.remove === 'function') {
          marker.remove();
        }
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

    if (!coursesToAdd || coursesToAdd.length === 0) {
      console.log("[MapMarkers] No courses to add markers for");
      return;
    }

    const bounds = new (window as any).mapboxgl.LngLatBounds();
    let validMarkersCount = 0;

    coursesToAdd.forEach(course => {
      if (!validateCoordinates(course.latitude, course.longitude)) {
        console.warn(`Course ${course.name} has invalid coordinates:`, { 
          lat: course.latitude, 
          lng: course.longitude 
        });
        return;
      }
      
      const lng = Number(course.longitude);
      const lat = Number(course.latitude);
      validMarkersCount++;
      
      const markerElement = createMarkerElement(course, onCourseSelect);
      const coordinates: [number, number] = [lng, lat];
      
      console.log(`Adding marker for ${course.name} at [${lng}, ${lat}]`);

      try {
        // Create marker with strict center anchoring - no offsets or custom positioning
        const marker = new (window as any).mapboxgl.Marker({
          element: markerElement,
          anchor: 'center'
        })
          .setLngLat(coordinates)
          .addTo(mapInstance);

        markersRef.current.push(marker);
        bounds.extend(coordinates);
      } catch (error) {
        console.warn(`Failed to add marker for ${course.name}:`, error);
        validMarkersCount--;
      }
    });

    console.log("[MapMarkers] Successfully added", validMarkersCount, "markers");

    // Fit bounds only if requested and we have valid markers
    if (shouldFitBounds && validMarkersCount > 0 && !bounds.isEmpty()) {
      setTimeout(() => {
        try {
          mapInstance.fitBounds(bounds, {
            padding: { top: 80, bottom: 80, left: 80, right: 80 },
            maxZoom: 12,
            duration: 1200,
          });
        } catch (error) {
          console.warn("[MapMarkers] Error fitting bounds:", error);
        }
      }, 400);
    }
  }, [onCourseSelect, clearMarkers]);

  const focusOnCourse = useCallback((mapInstance: any, course: GolfCourse, onComplete?: () => void) => {
    if (!validateCoordinates(course.latitude, course.longitude)) {
      console.warn("Cannot focus on course with invalid coordinates:", course.name);
      return;
    }

    const coordinates: [number, number] = [Number(course.longitude), Number(course.latitude)];
    console.log("[MapMarkers] Focusing on course:", course.name, "at coordinates:", coordinates);

    // Simple flyTo without complex easing
    mapInstance.flyTo({
      center: coordinates,
      zoom: 15,
      duration: 1500,
      essential: true
    });

    // Call completion callback after animation
    if (onComplete) {
      setTimeout(onComplete, 1800);
    }
  }, []);

  const cleanup = useCallback(() => {
    clearMarkers();
  }, [clearMarkers]);

  return {
    addMarkersToMap,
    focusOnCourse,
    clearMarkers,
    cleanup
  };
};
