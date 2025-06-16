
import { useEffect } from "react";

interface GolfCourse {
  id: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  website?: string;
  image_url?: string;
  description?: string;
}

interface MapMarkersProps {
  map: any;
  courses: GolfCourse[];
  onMarkerClick: (course: GolfCourse) => void;
}

export function MapMarkers({ map, courses, onMarkerClick }: MapMarkersProps) {
  useEffect(() => {
    if (!map || !courses) return;
    
    console.log("[MapMarkers] Adding markers for", courses.length, "courses");
    
    // Remove previous markers if any
    if (map.__lov_markers) {
      map.__lov_markers.forEach((marker: any) => marker.remove());
    }
    map.__lov_markers = [];

    const bounds = new (window as any).mapboxgl.LngLatBounds();
    let validCourses = 0;

    courses.forEach(course => {
      if (!course.latitude || !course.longitude) return;
      
      validCourses++;
      
      // Create custom marker element with better styling
      const el = document.createElement("div");
      el.className = "golf-marker";
      el.style.cssText = `
        width: 48px;
        height: 48px;
        background-color: #10b981;
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;
      
      el.innerHTML = `
        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
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
        console.log("[MapMarkers] Marker clicked:", course.name);
        onMarkerClick(course);
      });

      const marker = new (window as any).mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([course.longitude, course.latitude])
        .addTo(map);

      map.__lov_markers.push(marker);
      bounds.extend([course.longitude, course.latitude]);
    });

    console.log("[MapMarkers] Added", validCourses, "markers to map");

    // Fit map to show all markers with proper padding
    if (validCourses > 0) {
      try {
        map.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 12,
          duration: 1000,
        });
      } catch (error) {
        console.warn("[MapMarkers] Error fitting bounds:", error);
      }
    }

    return () => {
      if (map.__lov_markers) {
        map.__lov_markers.forEach((marker: any) => marker.remove());
        map.__lov_markers = [];
      }
    };
  }, [map, courses, onMarkerClick]);

  return null;
}
