
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
}

const MAPBOX_TOKEN = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';

export const MapContainer = ({ courses, onCourseSelect }: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { map, isLoading, error, updateMarkers, cleanup } = useMapboxWithMarkers({
    containerRef: mapContainerRef,
    center: [-58.3816, -34.6118],
    zoom: 6,
    accessToken: MAPBOX_TOKEN,
    courses,
    onCourseSelect
  });

  // Handle courses changes
  useEffect(() => {
    if (courses && courses.length > 0) {
      updateMarkers(courses);
    }
  }, [courses, updateMarkers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
