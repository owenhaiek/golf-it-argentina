
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
      // Validate coordinates more strictly
      const lat = parseFloat(String(course.latitude || 0));
      const lng = parseFloat(String(course.longitude || 0));
      
      if (!course.latitude || !course.longitude || isNaN(lat) || isNaN(lng)) {
        console.warn(`Course ${course.name} has invalid coordinates:`, { 
          lat: course.latitude, 
          lng: course.longitude,
          parsedLat: lat,
          parsedLng: lng
        });
        return;
      }
      
      validCourses++;
      
      // Create marker element with fixed positioning
      const el = document.createElement("div");
      el.className = "golf-course-marker";
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
        transition: all 0.2s ease;
        transform: translate(-50%, -50%);
        position: absolute;
        z-index: 1;
      `;
      
      el.innerHTML = `
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
        </svg>
      `;

      // Add hover effects
      el.addEventListener("mouseenter", () => {
        el.style.backgroundColor = "#059669";
        el.style.transform = "translate(-50%, -50%) scale(1.2)";
      });

      el.addEventListener("mouseleave", () => {
        el.style.backgroundColor = "#10b981";
        el.style.transform = "translate(-50%, -50%) scale(1)";
      });

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log("[MapContainer] Marker clicked:", course.name);
        onCourseSelect(course);
      });

      // Create coordinates array with proper type conversion
      const coordinates: [number, number] = [lng, lat];
      
      console.log(`Adding marker for ${course.name} at coordinates:`, coordinates);

      // Create marker with proper anchor and offset handling
      const marker = new (window as any).mapboxgl.Marker({
        element: el,
        anchor: "center",
        offset: [0, 0] // No offset since we handle centering with CSS transform
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
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          maxZoom: 13,
          duration: 1200,
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
      
      // Wait for map to be fully rendered
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
      // Ensure map style is loaded before adding markers
      if (map.isStyleLoaded()) {
        addMarkersToMap(map);
      } else {
        map.once('styledata', () => {
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
