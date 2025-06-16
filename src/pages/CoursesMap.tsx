
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const MAPBOX_TOKEN = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';

const CoursesMap = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  const { data: courses, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['courses-map'],
    queryFn: async () => {
      console.log("[CoursesMap] Fetching courses...");
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('name');
      if (error) throw error;
      console.log("[CoursesMap] Courses loaded:", data?.length || 0);
      return data || [];
    }
  });

  const { map, isLoading: mapLoading, error: mapError } = useSimpleMapbox({
    containerRef: mapContainerRef,
    center: [-58.3816, -34.6118],
    zoom: 6,
    accessToken: MAPBOX_TOKEN,
    onMapReady: (mapInstance) => {
      console.log("[CoursesMap] Map ready, adding markers...");
      addMarkersToMap(mapInstance);
    }
  });

  const addMarkersToMap = (mapInstance: any) => {
    if (!courses || courses.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new (window as any).mapboxgl.LngLatBounds();
    let validCourses = 0;

    courses.forEach(course => {
      if (!course.latitude || !course.longitude) return;
      
      validCourses++;
      
      // Create green marker element
      const el = document.createElement("div");
      el.className = "golf-marker";
      el.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: #10b981;
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;
      
      el.innerHTML = `
        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
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
        console.log("[CoursesMap] Marker clicked:", course.name);
        setSelectedCourse(course);
      });

      const marker = new (window as any).mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([course.longitude, course.latitude])
        .addTo(mapInstance);

      markersRef.current.push(marker);
      bounds.extend([course.longitude, course.latitude]);
    });

    console.log("[CoursesMap] Added", validCourses, "markers");

    // Fit map to show all markers
    if (validCourses > 0) {
      try {
        mapInstance.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 12,
          duration: 1000,
        });
      } catch (error) {
        console.warn("[CoursesMap] Error fitting bounds:", error);
      }
    }
  };

  // Re-add markers when courses load and map is ready
  useState(() => {
    if (map && courses && courses.length > 0) {
      addMarkersToMap(map);
    }
  }, [map, courses]);

  const handleRetry = () => {
    window.location.reload();
  };

  // Show error state
  if (mapError || coursesError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-6">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              {mapError ? "Map Loading Error" : "Data Loading Error"}
            </h3>
            <p className="text-red-600 mb-4 text-sm">
              {mapError || (coursesError ? String(coursesError) : "Failed to load golf courses")}
            </p>
            <Button 
              onClick={handleRetry}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (coursesLoading || mapLoading) {
    const loadingText = coursesLoading 
      ? 'Loading golf courses...' 
      : 'Loading map...';

    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-green-700 font-medium">{loadingText}</p>
          <p className="text-green-600 text-sm mt-2">
            Please wait while we load the map...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Map container with grey background */}
      <div className="absolute inset-0 bg-gray-200">
        <div
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: 'grab' }}
        />
        
        {/* Empty state */}
        {courses && courses.length === 0 && (
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
      </div>
      
      {/* Course info tab with slide-down animation */}
      {selectedCourse && (
        <CourseInfoTab 
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          isOpen={!!selectedCourse}
        />
      )}
    </div>
  );
};

export default CoursesMap;
