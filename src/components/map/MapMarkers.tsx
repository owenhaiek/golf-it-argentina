
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
      
      // Create custom marker element
      const el = document.createElement("div");
      el.className = "golf-marker";
      el.innerHTML = `
        <div class="w-12 h-12 bg-green-500 rounded-full border-4 border-white shadow-lg cursor-pointer hover:bg-green-600 transition-colors duration-200 flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
          </svg>
        </div>
      `;

      el.addEventListener("click", () => {
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

    // Fit map to show all markers
    if (validCourses > 0) {
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
        duration: 800,
      });
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
