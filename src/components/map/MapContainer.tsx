
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
      if (!course.latitude || !course.longitude) return;
      
      validCourses++;
      
      // Create green marker element
      const el = document.createElement("div");
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

      const marker = new (window as any).mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([course.longitude, course.latitude])
        .addTo(mapInstance);

      markersRef.current.push(marker);
      bounds.extend([course.longitude, course.latitude]);
    });

    console.log("[MapContainer] Added", validCourses, "markers");

    // Fit map to show all markers
    if (validCourses > 0) {
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
  };

  const { map, isLoading, error } = useSimpleMapbox({
    containerRef: mapContainerRef,
    center: [-58.3816, -34.6118],
    zoom: 6,
    accessToken: MAPBOX_TOKEN,
    onMapReady: (mapInstance) => {
      console.log("[MapContainer] Map ready, adding markers...");
      if (courses && courses.length > 0) {
        addMarkersToMap(mapInstance);
      }
    }
  });

  // Re-add markers when courses load and map is ready
  useEffect(() => {
    if (map && courses && courses.length > 0) {
      addMarkersToMap(map);
    }
  }, [map, courses]);

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
