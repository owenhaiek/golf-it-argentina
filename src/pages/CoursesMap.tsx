
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
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [markers, setMarkers] = useState<any[]>([]);
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Preload courses data
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
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Check if Mapbox is already available
  useEffect(() => {
    if (window.mapboxgl) {
      console.log("Mapbox already available");
      setScriptsLoaded(true);
      return;
    }
  }, []);

  // Load Mapbox scripts only if not already loaded
  useEffect(() => {
    if (scriptsLoaded || window.mapboxgl) return;

    const loadMapboxScripts = async () => {
      try {
        console.log("Loading Mapbox scripts...");
        setIsInitializing(true);
        
        // Check if script is already loading
        if (document.querySelector('script[src*="mapbox-gl"]')) {
          console.log("Mapbox script already loading, waiting...");
          // Wait for it to load
          const checkInterval = setInterval(() => {
            if (window.mapboxgl) {
              clearInterval(checkInterval);
              console.log("Mapbox became available");
              setScriptsLoaded(true);
              setIsInitializing(false);
            }
          }, 100);
          
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.mapboxgl) {
              setInitError("Map loading timed out");
              setIsInitializing(false);
            }
          }, 10000);
          return;
        }

        // Load CSS first
        if (!document.querySelector('link[href*="mapbox-gl"]')) {
          const link = document.createElement('link');
          link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
        script.async = false;
        
        script.onload = () => {
          console.log("Mapbox scripts loaded successfully");
          setScriptsLoaded(true);
          setIsInitializing(false);
        };
        
        script.onerror = () => {
          console.error("Failed to load Mapbox scripts");
          setInitError("Failed to load map resources");
          setIsInitializing(false);
        };
        
        document.head.appendChild(script);
        
      } catch (error) {
        console.error("Error loading Mapbox:", error);
        setInitError("Failed to load map resources");
        setIsInitializing(false);
      }
    };

    loadMapboxScripts();
  }, [scriptsLoaded]);

  // Initialize map when everything is ready
  useEffect(() => {
    if (!scriptsLoaded || !mapContainerRef.current || map || initError || !window.mapboxgl || isInitializing) {
      return;
    }

    const initializeMap = () => {
      try {
        console.log("Initializing map...");
        
        // Clear any existing map
        if (map) {
          map.remove();
          setMap(null);
        }
        
        window.mapboxgl.accessToken = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';

        const mapInstance = new window.mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-58.3816, -34.6118],
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

        mapInstance.on('error', (e: any) => {
          console.error("Map error:", e);
          setInitError("Map failed to load properly");
        });

        setMap(mapInstance);

      } catch (error) {
        console.error('Error initializing map:', error);
        setInitError("Failed to initialize map");
      }
    };

    // Initialize immediately if ready
    initializeMap();

    return () => {
      if (map) {
        console.log("Cleaning up map");
        map.remove();
        setMap(null);
        setMapLoaded(false);
      }
    };
  }, [scriptsLoaded, initError, isInitializing]);

  // Add markers when courses and map are ready
  useEffect(() => {
    if (!map || !mapLoaded || !courses || courses.length === 0 || !window.mapboxgl) return;

    console.log(`Adding ${courses.length} markers to map...`);

    // Clear existing markers
    markers.forEach(marker => {
      if (marker && marker.remove) {
        marker.remove();
      }
    });
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
        {(coursesLoading || !scriptsLoaded || isInitializing) ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-green-700 font-medium">
                {isInitializing ? 'Initializing map...' : 
                 !scriptsLoaded ? 'Loading map resources...' : 
                 'Loading golf courses...'}
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
            {!mapLoaded && scriptsLoaded && !isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                  <p className="text-green-700 font-medium">Initializing map...</p>
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
                      No golf courses found with location data.
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
