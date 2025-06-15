
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

// Global flag to track if Mapbox is loaded
let mapboxLoaded = false;
let mapboxPromise: Promise<void> | null = null;

const loadMapboxScripts = (): Promise<void> => {
  // Return existing promise if already loading
  if (mapboxPromise) return mapboxPromise;
  
  // Return resolved promise if already loaded
  if (mapboxLoaded || window.mapboxgl) {
    mapboxLoaded = true;
    return Promise.resolve();
  }

  mapboxPromise = new Promise((resolve, reject) => {
    console.log("Loading Mapbox scripts...");
    
    // Load CSS first
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.async = true;
    
    script.onload = () => {
      console.log("Mapbox scripts loaded successfully");
      mapboxLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      console.error("Failed to load Mapbox scripts");
      mapboxPromise = null; // Reset promise to allow retry
      reject(new Error("Failed to load Mapbox"));
    };
    
    document.head.appendChild(script);
  });

  return mapboxPromise;
};

const CoursesMap = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(mapboxLoaded);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [initError, setInitError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Preload courses data with better caching
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['courses-map'],
    queryFn: async () => {
      console.log("Fetching courses for map...");
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('name');
      if (error) throw error;
      console.log(`Found ${data?.length || 0} courses with coordinates`);
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  // Load Mapbox scripts immediately on component mount
  useEffect(() => {
    if (!scriptsLoaded) {
      loadMapboxScripts()
        .then(() => setScriptsLoaded(true))
        .catch((error) => {
          console.error("Error loading Mapbox:", error);
          setInitError("Failed to load map resources");
        });
    }
  }, [scriptsLoaded]);

  // Initialize map when scripts are loaded and container is ready
  useEffect(() => {
    if (!scriptsLoaded || !mapContainerRef.current || map || initError) return;

    const initializeMap = async () => {
      try {
        console.log("Initializing map...");
        
        if (!window.mapboxgl) {
          throw new Error("Mapbox GL not available");
        }

        window.mapboxgl.accessToken = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';

        const mapInstance = new window.mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-58.3816, -34.6118], // Default to Buenos Aires
          zoom: 6,
          pitch: 0,
          bearing: 0,
          antialias: true,
          attributionControl: false,
          preserveDrawingBuffer: true,
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
          console.log("Map loaded successfully");
          setMapLoaded(true);
        });

        mapInstance.on('error', (e) => {
          console.error("Map error:", e);
          setInitError("Map failed to load properly");
        });

        setMap(mapInstance);

      } catch (error) {
        console.error('Error initializing map:', error);
        setInitError("Failed to initialize map");
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
        setMap(null);
        setMapLoaded(false);
      }
    };
  }, [scriptsLoaded, map, initError]);

  // Add markers when courses and map are ready
  useEffect(() => {
    if (!map || !mapLoaded || !courses || courses.length === 0) return;

    console.log(`Adding ${courses.length} markers to map...`);

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    setMarkers([]);

    const newMarkers: mapboxgl.Marker[] = [];
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

    // Fit map to show all markers with animation
    if (courses.length > 0) {
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
        duration: 1000,
      });
    }
  }, [map, mapLoaded, courses]);

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  // Show error state
  if (initError || coursesError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-6">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">
              {initError || "Failed to load golf courses"}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Map container */}
      <div className="absolute inset-0">
        {(coursesLoading || !scriptsLoaded) ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-green-700 font-medium">
                {!scriptsLoaded ? 'Cargando mapa...' : 'Cargando campos de golf...'}
              </p>
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
                  <p className="text-green-700 font-medium">Inicializando mapa...</p>
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
      <style>{`
        .golf-marker:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default CoursesMap;
