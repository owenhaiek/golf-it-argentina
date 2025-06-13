
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";

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
  opening_hours?: any;
  hole_pars?: number[];
  hole_handicaps?: number[];
  image_gallery?: string;
  established_year?: number;
  type?: string;
}

const CoursesMap = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [map, setMap] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markers, setMarkers] = useState<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || mapLoaded) return;

    // Load Mapbox script if not already loaded
    if (!window.mapboxgl) {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = true;
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    } else {
      initializeMap();
    }
  }, [mapLoaded]);

  const initializeMap = () => {
    if (!mapContainerRef.current) return;

    try {
      // Set your Mapbox access token here
      window.mapboxgl.accessToken = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';

      const mapInstance = new window.mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11', // Clean, minimal style
        center: [-58.3816, -34.6118], // Default to Buenos Aires
        zoom: 6,
        pitch: 0,
        bearing: 0,
        antialias: true,
        attributionControl: false,
      });

      // Add navigation controls
      mapInstance.addControl(
        new window.mapboxgl.NavigationControl({
          showCompass: false,
          showZoom: true,
        }),
        'bottom-right'
      );

      mapInstance.on('load', () => {
        setMapLoaded(true);
        setMap(mapInstance);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // Add markers when courses and map are ready
  useEffect(() => {
    if (!map || !courses || courses.length === 0) return;

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    setMarkers([]);

    const newMarkers: any[] = [];
    const bounds = new window.mapboxgl.LngLatBounds();

    courses.forEach((course) => {
      if (!course.latitude || !course.longitude) return;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'golf-marker';
      markerElement.innerHTML = `
        <div class="w-12 h-12 bg-green-500 rounded-full border-4 border-white shadow-lg cursor-pointer hover:bg-green-600 transition-colors duration-200 flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
          </svg>
        </div>
      `;

      // Add click event to marker
      markerElement.addEventListener('click', () => {
        setSelectedCourse(course);
        // Fly to the course location
        map.flyTo({
          center: [course.longitude!, course.latitude!],
          zoom: 14,
          duration: 1000,
        });
      });

      // Create marker
      const marker = new window.mapboxgl.Marker({
        element: markerElement,
        anchor: 'center',
      })
        .setLngLat([course.longitude, course.latitude])
        .addTo(map);

      newMarkers.push(marker);
      bounds.extend([course.longitude, course.latitude]);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (courses.length > 0) {
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
        duration: 1000,
      });
    }
  }, [map, courses]);

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Map container */}
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-green-700 font-medium">Cargando campos de golf...</p>
            </div>
          </div>
        ) : (
          <>
            <div
              ref={mapContainerRef}
              className="absolute inset-0 w-full h-full"
              style={{ cursor: 'grab' }}
            />
            
            {/* Loading overlay for map */}
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                  <p className="text-green-700 font-medium">Cargando mapa...</p>
                </div>
              </div>
            )}

            {/* No courses message */}
            {courses && courses.length === 0 && mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm">
                  <CardContent className="text-center p-6">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No se encontraron campos de golf con datos de ubicación.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {/* Course info slide-down tab */}
      {selectedCourse && (
        <CourseInfoTab 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)} 
          isOpen={!!selectedCourse}
        />
      )}

      {/* Custom styles for markers */}
      <style jsx>{`
        .golf-marker:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default CoursesMap;
