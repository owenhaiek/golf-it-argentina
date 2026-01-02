import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer } from "@/components/map/MapContainer";
import { MapSearchOverlay } from "@/components/map/MapSearchOverlay";
import { MapActionMenu } from "@/components/map/MapActionMenu";
import { MapLoadingState } from "@/components/map/MapLoadingState";
import { MapErrorState } from "@/components/map/MapErrorState";
import { MapEmptyState } from "@/components/map/MapEmptyState";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";
import { MapFilterMenu, MapFilters } from "@/components/map/MapFilterMenu";

interface GolfCourse {
  id: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  description?: string;
  image_url?: string;
  image_gallery?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  website?: string;
  is_open?: boolean;
}

const CoursesMap = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [hasEntryAnimated, setHasEntryAnimated] = useState(false);
  const [filters, setFilters] = useState<MapFilters>({
    isOpen: null,
    holes: null,
    topRated: false,
    maxDistance: 0
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<any>(null);
  const [searchParams] = useSearchParams();

  const handleCourseSelect = (course: GolfCourse) => {
    // Prevent re-selecting the same course (fixes reopening issue)
    if (selectedCourse?.id === course.id) {
      return;
    }
    
    setSelectedCourse(course);
    
    // Center map on course
    if (mapRef.current && course.latitude && course.longitude) {
      mapRef.current.flyTo({
        center: [course.longitude, course.latitude],
        zoom: 14,
        duration: 1500,
        essential: true
      });
    }
  };

  const handleCloseInfoTab = () => {
    setSelectedCourse(null);
  };

  const handleSearchSelect = (course: GolfCourse) => {
    handleCourseSelect(course);
  };

  // Fetch golf courses
  const { data: courses = [], isLoading, error, refetch } = useQuery({
    queryKey: ['golf-courses-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('id, name, city, state, par, holes, description, image_url, image_gallery, latitude, longitude, address, phone, website, is_open')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      if (error) throw error;
      return (data || []) as GolfCourse[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch course ratings for top rated filter
  const { data: courseRatings = {} } = useQuery({
    queryKey: ['course-ratings-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_reviews')
        .select('course_id, rating');
      
      if (error) throw error;
      
      // Calculate average rating per course
      const ratings: Record<string, { sum: number; count: number; average: number }> = {};
      (data || []).forEach((review) => {
        if (!ratings[review.course_id]) {
          ratings[review.course_id] = { sum: 0, count: 0, average: 0 };
        }
        ratings[review.course_id].sum += review.rating;
        ratings[review.course_id].count += 1;
        ratings[review.course_id].average = ratings[review.course_id].sum / ratings[review.course_id].count;
      });
      
      return ratings;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Subscribe to real-time updates for golf course status changes
  useEffect(() => {
    const channel = supabase
      .channel('golf-courses-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'golf_courses'
        },
        (payload) => {
          console.log('Golf course updated:', payload);
          // Refetch courses when any course is updated
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Filter courses based on active filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Filter by open/closed status
      if (filters.isOpen !== null) {
        const courseIsOpen = course.is_open !== false;
        if (filters.isOpen !== courseIsOpen) return false;
      }
      
      // Filter by holes
      if (filters.holes !== null) {
        if (course.holes !== filters.holes) return false;
      }
      
      // Filter by top rated (4+ stars)
      if (filters.topRated) {
        const rating = courseRatings[course.id];
        if (!rating || rating.average < 4) return false;
      }

      // Filter by distance
      if (filters.maxDistance > 0 && filters.maxDistance < 500 && userLocation && course.latitude && course.longitude) {
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          course.latitude, course.longitude
        );
        if (distance > filters.maxDistance) return false;
      }
      
      return true;
    });
  }, [courses, filters, courseRatings, userLocation]);

  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => setHasEntryAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-focus on course from URL param
  useEffect(() => {
    const focusCourseId = searchParams.get('focus');
    if (focusCourseId && courses.length > 0) {
      const courseToFocus = courses.find(c => c.id === focusCourseId);
      if (courseToFocus) {
        setTimeout(() => handleCourseSelect(courseToFocus), 500);
      }
    }
  }, [courses, searchParams]);

  if (error) {
    return <MapErrorState onRetry={() => window.location.reload()} />;
  }

  if (isLoading) {
    return <MapLoadingState coursesLoading={true} mapLoading={true} />;
  }

  return (
    <motion.div 
      className="relative w-full h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: hasEntryAnimated ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Map */}
      <MapContainer 
        courses={filteredCourses}
        onCourseSelect={handleCourseSelect}
        focusCourseId={selectedCourse?.id}
        onMapReady={(map) => { mapRef.current = map; }}
      />
      
      {/* Empty state overlay */}
      {filteredCourses.length === 0 && <MapEmptyState />}
      
      {/* Search overlay with profile button */}
      <MapSearchOverlay 
        courses={filteredCourses}
        onSelectCourse={handleSearchSelect}
      />
      
      {/* Filter menu (bottom left) */}
      <MapFilterMenu 
        filters={filters}
        onFiltersChange={setFilters}
        userLocation={userLocation}
      />
      
      {/* Action menu (bottom right) */}
      <MapActionMenu />
      
      {/* Course info tab (bottom sheet) */}
      <CourseInfoTab 
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={handleCloseInfoTab}
      />
    </motion.div>
  );
};

export default CoursesMap;
