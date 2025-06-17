
import { useRef, useEffect } from "react";
import { useSimpleMapbox } from "@/hooks/useSimpleMapbox";

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

interface MapContainerProps {
  courses: GolfCourse[];
  onCourseSelect: (course: GolfCourse) => void;
}

const MAPBOX_TOKEN = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';

export const MapContainer = ({ courses, onCourseSelect }: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const coursesRef = useRef<GolfCourse[]>([]);

  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (e) {
        console.warn("Error removing marker:", e);
      }
    });
    markersRef.current = [];
  };

  const addMarkersToMap = (mapInstance: any, coursesToAdd: GolfCourse[]) => {
    console.log("[MapContainer] Adding markers for", coursesToAdd.length, "courses");

    // Clear existing markers
    clearMarkers();

    const bounds = new (window as any).mapboxgl.LngLatBounds();
    let validCourses = 0;

    coursesToAdd.forEach(course => {
      const lat = Number(course.latitude);
      const lng = Number(course.longitude);
      
      // Strict validation
      if (!course.latitude || !course.longitude || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        console.warn(`Course ${course.name} has invalid coordinates:`, { 
          lat: course.latitude, 
          lng: course.longitude 
        });
        return;
      }
      
      validCourses++;
      
      // Create marker element with proper styling
      const el = document.createElement("div");
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: #10b981;
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: transform 0.2s ease, background-color 0.2s ease;
      `;
      
      el.innerHTML = `
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style="pointer-events: none;">
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
        </svg>
      `;

      // Add hover effects
      el.addEventListener("mouseenter", () => {
        el.style.backgroundColor = "#059669";
        el.style.transform = "scale(1.2)";
      });

      el.addEventListener("mouseleave", () => {
        el.style.backgroundColor = "#10b981";
        el.style.transform = "scale(1)";
      });

      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("[MapContainer] Marker clicked:", course.name);
        onCourseSelect(course);
      });

      // Create marker with proper coordinates [longitude, latitude]
      const coordinates: [number, number] = [lng, lat];
      
      console.log(`Adding marker for ${course.name} at [${lng}, ${lat}]`);

      // Create marker with center anchor to prevent floating
      const marker = new (window as any).mapboxgl.Marker({
        element: el,
        anchor: "center"
      })
        .setLngLat(coordinates)
        .addTo(mapInstance);

      markersRef.current.push(marker);
      bounds.extend(coordinates);
    });

    console.log("[MapContainer] Added", validCourses, "valid markers");

    // Fit bounds only if we have valid courses and this is the first load
    if (validCourses > 0 && coursesRef.current.length === 0) {
      try {
        mapInstance.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 12,
          duration: 1000,
        });
      } catch (error) {
        console.warn("[MapContainer] Error fitting bounds:", error);
      }
    }

    // Update courses reference
    coursesRef.current = coursesToAdd;
  };

  const { map, isLoading, error } = useSimpleMapbox({
    containerRef: mapContainerRef,
    center: [-58.3816, -34.6118], // Argentina center
    zoom: 6,
    accessToken: MAPBOX_TOKEN,
    onMapReady: (mapInstance) => {
      console.log("[MapContainer] Map ready");
      
      // Wait for map to be fully loaded before adding markers
      mapInstance.on('idle', () => {
        if (courses && courses.length > 0 && markersRef.current.length === 0) {
          addMarkersToMap(mapInstance, courses);
        }
      });
    }
  });

  // Handle courses changes
  useEffect(() => {
    if (!map || !courses) return;

    // Only update markers if courses actually changed
    const coursesChanged = courses.length !== coursesRef.current.length || 
      courses.some((course, index) => course.id !== coursesRef.current[index]?.id);

    if (coursesChanged && map.isStyleLoaded()) {
      addMarkersToMap(map, courses);
    }
  }, [courses, map]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
      coursesRef.current = [];
    };
  }, []);

  return (
    <>
      {/* Ensure Mapbox CSS is loaded */}
      <link
        href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
        rel="stylesheet"
      />
      
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          cursor: 'grab',
          minHeight: '100vh',
          minWidth: '100vw'
        }}
      />
    </>
  );
};
