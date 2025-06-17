
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
  const mapReadyRef = useRef(false);
  const markersAddedRef = useRef(false);

  const addMarkersToMap = (mapInstance: any) => {
    if (!courses || courses.length === 0 || markersAddedRef.current) return;

    console.log("[MapContainer] Adding markers for", courses.length, "courses");

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new (window as any).mapboxgl.LngLatBounds();
    let validCourses = 0;

    courses.forEach(course => {
      // Validate coordinates strictly
      const lat = parseFloat(String(course.latitude || 0));
      const lng = parseFloat(String(course.longitude || 0));
      
      if (!course.latitude || !course.longitude || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        console.warn(`Course ${course.name} has invalid coordinates:`, { 
          lat: course.latitude, 
          lng: course.longitude,
          parsedLat: lat,
          parsedLng: lng
        });
        return;
      }
      
      validCourses++;
      
      // Create marker element
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
      `;
      
      el.innerHTML = `
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
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
        e.stopPropagation();
        console.log("[MapContainer] Marker clicked:", course.name);
        onCourseSelect(course);
      });

      // Create coordinates - ensure correct order [longitude, latitude]
      const coordinates: [number, number] = [lng, lat];
      
      console.log(`Adding marker for ${course.name} at [${lng}, ${lat}]`);

      // Create marker with center anchor
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

    // Fit map to show all markers only once
    if (validCourses > 0 && !markersAddedRef.current) {
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

    markersAddedRef.current = true;
  };

  const { map, isLoading, error } = useSimpleMapbox({
    containerRef: mapContainerRef,
    center: [-58.3816, -34.6118], // Argentina center
    zoom: 6,
    accessToken: MAPBOX_TOKEN,
    onMapReady: (mapInstance) => {
      console.log("[MapContainer] Map ready");
      mapReadyRef.current = true;
      
      // Add markers once when map is ready and loaded
      mapInstance.once('idle', () => {
        if (courses && courses.length > 0 && !markersAddedRef.current) {
          addMarkersToMap(mapInstance);
        }
      });
    }
  });

  // Add markers when courses change and map is ready
  useEffect(() => {
    if (map && mapReadyRef.current && courses && courses.length > 0) {
      // Reset markers added flag when courses change
      markersAddedRef.current = false;
      
      if (map.isStyleLoaded()) {
        addMarkersToMap(map);
      } else {
        map.once('styledata', () => {
          addMarkersToMap(map);
        });
      }
    }
  }, [courses]); // Only depend on courses, not map

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      markersAddedRef.current = false;
      mapReadyRef.current = false;
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
