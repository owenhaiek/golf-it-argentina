
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CourseMarker } from "@/components/map/CourseMarker";
import { CoursePopup } from "@/components/map/CoursePopup";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";
import { useMapOptimization } from "@/hooks/useMapOptimization";
import { MapSkeleton } from "@/components/ui/LoadingSkeleton";

interface GolfCourse {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  holes: number;
  par: number | null;
  image_url: string | null;
  description: string | null;
}

const CoursesMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const { isMapLoaded, mapError, initializeMap } = useMapOptimization();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses-with-coordinates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('id, name, latitude, longitude, city, state, holes, par, image_url, description')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    if (!mapContainer.current || mapInstance || courses.length === 0) return;

    const setupMap = async () => {
      try {
        const map = await initializeMap(mapContainer.current!, {
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: [-58.3816, -34.6037], // Buenos Aires, Argentina
          zoom: 6,
          accessToken: 'pk.eyJ1IjoiYWxlamFuZHJvMTIzNCIsImEiOiJjbTR4dHZxc3cwb3N2Mm1zOTNnNW5mOXp2In0.lH6yCjgpOwGxHN5sS6xHYQ'
        });

        setMapInstance(map);

        // Add markers for courses
        courses.forEach((course) => {
          if (course.latitude && course.longitude) {
            const marker = new window.mapboxgl.Marker({
              element: CourseMarker({ course, onClick: () => setSelectedCourse(course) })
            })
              .setLngLat([course.longitude, course.latitude])
              .addTo(map);
          }
        });

        // Fit map to show all courses
        if (courses.length > 0) {
          const bounds = new window.mapboxgl.LngLatBounds();
          courses.forEach(course => {
            if (course.latitude && course.longitude) {
              bounds.extend([course.longitude, course.latitude]);
            }
          });
          map.fitBounds(bounds, { padding: 50 });
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    setupMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
    };
  }, [courses, mapInstance, initializeMap]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-shrink-0 p-4 bg-background border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Golf Courses Map</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Explore golf courses across Argentina
          </p>
        </div>
        <div className="flex-1 p-4">
          <MapSkeleton />
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-shrink-0 p-4 bg-background border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Golf Courses Map</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">Map Failed to Load</h3>
            <p className="text-muted-foreground">{mapError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Golf Courses Map</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Explore {courses.length} golf courses across Argentina
        </p>
      </div>
      
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        
        {selectedCourse && (
          <>
            <CoursePopup 
              course={selectedCourse} 
              onClose={() => setSelectedCourse(null)} 
            />
            <CourseInfoTab 
              course={selectedCourse} 
              onClose={() => setSelectedCourse(null)} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesMap;
