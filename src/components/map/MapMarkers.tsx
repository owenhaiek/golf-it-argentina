
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
    // Remove previous markers if any
    let markers: any[] = [];
    map.__lov_markers?.forEach((marker: any) => marker.remove());
    map.__lov_markers = [];

    const bounds = new window.mapboxgl.LngLatBounds();

    courses.forEach(course => {
      if (!course.latitude || !course.longitude) return;
      const el = document.createElement("div");
      el.className = "golf-marker";
      el.innerHTML = `
        <div class="w-12 h-12 bg-green-500 rounded-full border-4 border-white shadow-lg cursor-pointer hover:bg-green-600 transition-colors duration-200 flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
          </svg>
        </div>
      `;
      el.addEventListener("click", () => onMarkerClick(course));
      const marker = new window.mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([course.longitude, course.latitude])
        .addTo(map);
      markers.push(marker);
      bounds.extend([course.longitude, course.latitude]);
    });
    map.__lov_markers = markers;
    if (courses.length > 0) {
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
        duration: 800,
      });
    }

    return () => {
      markers.forEach(marker => marker.remove());
      map.__lov_markers = [];
    };
  }, [map, courses, onMarkerClick]);

  return null;
}
