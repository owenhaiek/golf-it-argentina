
import { useRef, useEffect } from "react";
import { useMapboxWithMarkers } from "@/hooks/useMapboxWithMarkers";

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
  focusCourseId?: string | null;
}

const MAPBOX_TOKEN = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';

export const MapContainer = ({ courses, onCourseSelect, focusCourseId }: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { map, isLoading, error, cleanup } = useMapboxWithMarkers({
    containerRef: mapContainerRef,
    center: [-58.3816, -34.6118],
    zoom: 6,
    accessToken: MAPBOX_TOKEN,
    courses,
    onCourseSelect,
    focusCourseId
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Ensure Mapbox CSS is loaded
  useEffect(() => {
    const linkId = 'mapbox-gl-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 w-full h-full"
      style={{ 
        cursor: 'grab',
        minHeight: '100vh',
        minWidth: '100vw'
      }}
    />
  );
};
