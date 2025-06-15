
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";
import { useMapbox } from "@/hooks/useMapbox";
import { MapMarkers } from "@/components/map/MapMarkers";

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

const MAPBOX_TOKEN = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';

const CoursesMap = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [initError, setInitError] = useState<string|null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const { data: courses, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['courses-map'],
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
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // --- MAPBOX ---
  const {
    map,
    mapLoaded,
    scriptsLoaded,
    initError: mapboxError,
  } = useMapbox({
    containerRef: mapContainerRef,
    center: [-58.3816, -34.6118],
    zoom: 6,
    accessToken: MAPBOX_TOKEN,
    onMapLoaded: () => {
      setIsInitializing(false);
    },
  });

  useEffect(() => {
    setInitError(mapboxError);
  }, [mapboxError]);

  useEffect(() => {
    if (!scriptsLoaded) {
      setIsInitializing(true);
      return;
    }
    if (scriptsLoaded && !mapLoaded) {
      setIsInitializing(true);
      return;
    }
    if (mapLoaded) {
      setIsInitializing(false);
    }
  }, [scriptsLoaded, mapLoaded]);

  // Announce phase in console for diagnostics
  useEffect(() => {
    if (!scriptsLoaded) console.log("Mapbox scripts still loading...");
    else if (!mapLoaded && isInitializing) console.log("Mapbox scripts loaded, waiting for map to init...");
    else if (mapLoaded) console.log("Map loaded and ready.");
  }, [scriptsLoaded, mapLoaded, isInitializing]);

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
                {isInitializing || !mapLoaded ? 'Initializing map...' : 
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
            {/* Markers */}
            {map && courses && courses.length > 0 && (
              <MapMarkers map={map} courses={courses} onMarkerClick={setSelectedCourse} />
            )}
            {!mapLoaded && scriptsLoaded && isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                  <p className="text-green-700 font-medium">Initializing map...</p>
                </div>
              </div>
            )}
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
      {selectedCourse && (
        <CourseInfoTab 
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          isOpen={!!selectedCourse}
        />
      )}
      <style>{`.golf-marker:hover { transform: scale(1.1); }`}</style>
    </div>
  );
};

export default CoursesMap;
