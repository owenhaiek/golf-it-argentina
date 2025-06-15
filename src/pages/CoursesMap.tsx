
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMapOptimization } from '@/hooks/useMapOptimization';
import { CourseMarker } from '@/components/map/CourseMarker';
import { CoursePopup } from '@/components/map/CoursePopup';
import { CourseInfoTab } from '@/components/map/CourseInfoTab';
import { Button } from '@/components/ui/button';
import { MapPin, List } from 'lucide-react';
import { MapSkeleton } from '@/components/ui/LoadingSkeleton';

interface GolfCourse {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  holes: number;
  par: number | null;
  image_url: string | null;
  description: string | null;
}

const CoursesMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [showCourseList, setShowCourseList] = useState(false);
  const { initializeMap, isMapLoaded, mapError, mapInstance } = useMapOptimization();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['golf-courses-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;
      return data as GolfCourse[];
    }
  });

  useEffect(() => {
    if (!mapContainer.current || courses.length === 0) return;

    const initMap = async () => {
      try {
        const map = await initializeMap(mapContainer.current!, {
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: [-98.5795, 39.8283], // Center of US
          zoom: 4,
          accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
        });

        // Wait for map to be fully loaded
        map.on('load', () => {
          // Add markers for all courses
          courses.forEach(course => {
            if (course.latitude && course.longitude && window.mapboxgl) {
              const marker = new window.mapboxgl.Marker({
                color: '#10b981'
              })
                .setLngLat([course.longitude, course.latitude])
                .addTo(map);

              marker.getElement().addEventListener('click', () => {
                setSelectedCourse(course);
              });
            }
          });

          // Fit map to show all courses if we have multiple courses
          if (courses.length > 1 && window.mapboxgl) {
            const bounds = new window.mapboxgl.LngLatBounds();
            courses.forEach(course => {
              if (course.latitude && course.longitude) {
                bounds.extend([course.longitude, course.latitude]);
              }
            });
            map.fitBounds(bounds, { padding: 50 });
          }
        });

      } catch (error) {
        console.error('Map initialization error:', error);
      }
    };

    initMap();
  }, [courses, initializeMap]);

  if (isLoading) {
    return (
      <div className="h-screen w-full">
        <MapSkeleton />
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Map Unavailable</h2>
          <p className="text-muted-foreground">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Floating Controls */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setShowCourseList(!showCourseList)}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Course List Sidebar */}
      {showCourseList && (
        <div className="absolute top-0 left-0 w-80 h-full bg-background border-r overflow-y-auto z-20">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Golf Courses</h2>
            <div className="space-y-2">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => {
                    setSelectedCourse(course);
                    if (mapInstance && course.latitude && course.longitude) {
                      mapInstance.flyTo({
                        center: [course.longitude, course.latitude],
                        zoom: 14
                      });
                    }
                  }}
                >
                  <h3 className="font-medium">{course.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {[course.city, course.state].filter(Boolean).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Course Info Tab */}
      {selectedCourse && (
        <CourseInfoTab 
          course={selectedCourse} 
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
};

export default CoursesMap;
