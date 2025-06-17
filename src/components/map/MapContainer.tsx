
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

  const addMarkersToMap = (mapInstance: any) => {
    if (!courses || courses.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new (window as any).mapboxgl.LngLatBounds();
    let validCourses = 0;

    courses.forEach(course => {
      if (!course.latitude || !course.longitude) {
        console.warn(`Course ${course.name} missing coordinates:`, { lat: course.latitude, lng: course.longitude });
        return;
      }
      
      validCourses++;
      
      // Create marker element with proper positioning
      const el = document.createElement("div");
      el.className = "golf-course-marker";
      el.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: #10b981;
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        position: relative;
      `;
      
      el.innerHTML = `
        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
        </svg>
      `;

      // Add hover effects
      el.addEventListener("mouseenter", () => {
        el.style.backgroundColor = "#059669";
        el.style.transform = "scale(1.1)";
      });

      el.addEventListener("mouseleave", () => {
        el.style.backgroundColor = "#10b981";
        el.style.transform = "scale(1)";
      });

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log("[MapContainer] Marker clicked:", course.name);
        onCourseSelect(course);
      });

      // Create marker with proper coordinate positioning
      const coordinates: [number, number] = [Number(course.longitude), Number(course.latitude)];
      
      console.log(`Adding marker for ${course.name} at coordinates:`, coordinates);

      const marker = new (window as any).mapboxgl.Marker({
        element: el,
        anchor: "center", // Anchor to center ensures proper positioning
      })
        .setLngLat(coordinates)
        .addTo(mapInstance);

      markersRef.current.push(marker);
      bounds.extend(coordinates);
    });

    console.log("[MapContainer] Added", validCourses, "markers with coordinates");

    // Fit map to show all markers with padding
    if (validCourses > 0) {
      try {
        mapInstance.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          maxZoom: 14,
          duration: 1500,
        });
      } catch (error) {
        console.warn("[MapContainer] Error fitting bounds:", error);
      }
    }
  };

  const { map, isLoading, error } = useSimpleMapbox({
    containerRef: mapContainerRef,
    center: [-58.3816, -34.6118], // Argentina center
    zoom: 6,
    accessToken: MAPBOX_TOKEN,
    onMapReady: (mapInstance) => {
      console.log("[MapContainer] Map ready, adding markers...");
      
      // Ensure map is fully loaded before adding markers
      mapInstance.on('idle', () => {
        if (courses && courses.length > 0) {
          addMarkersToMap(mapInstance);
        }
      });
    }
  });

  // Re-add markers when courses change and map is ready
  useEffect(() => {
    if (map && courses && courses.length > 0) {
      // Wait for map to be fully ready before adding markers
      if (map.isStyleLoaded()) {
        addMarkersToMap(map);
      } else {
        map.on('styledata', () => {
          addMarkersToMap(map);
        });
      }
    }
  }, [map, courses]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
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
