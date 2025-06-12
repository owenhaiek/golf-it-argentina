
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CourseInfoTab } from "@/components/map/CourseInfoTab";
import { CourseMarker } from "@/components/map/CourseMarker";
import { GoogleMap, LoadScript } from '@react-google-maps/api';

interface Course {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  holes: number;
  par?: number;
  image_url?: string;
  opening_hours?: any;
}

const CoursesMap = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const mapContainerStyle = {
    width: '100%',
    height: '800px',
  };

  const mapOptions = {
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
    ],
    disableDefaultUI: true,
    zoomControl: true,
  };

  const center = {
    lat: -34.6037,
    lng: -58.3816,
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('golf_courses')
          .select('id, name, latitude, longitude, address, city, state, phone, website, holes, par, image_url, opening_hours');

        if (error) {
          console.error("Error fetching golf courses:", error);
          toast({
            title: "Error",
            description: "Failed to load golf courses.",
            variant: "destructive",
          });
        }

        setCourses(data || []);
      } catch (error) {
        console.error("Unexpected error fetching golf courses:", error);
        toast({
          title: "Error",
          description: "Failed to load golf courses due to an unexpected error.",
          variant: "destructive",
        });
      }
    };

    fetchCourses();
  }, [toast]);

  const handleMarkerClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCloseInfoTab = () => {
    setSelectedCourse(null);
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        defaultCenter={center}
        defaultZoom={10}
        options={mapOptions}
      >
        {courses.map((course) => (
          <CourseMarker
            key={course.id}
            course={course}
            isOpen={selectedCourse?.id === course.id}
            onClick={() => handleMarkerClick(course)}
          />
        ))}

        {selectedCourse && (
          <CourseInfoTab
            course={selectedCourse}
            isOpen={true}
            onClose={handleCloseInfoTab}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default CoursesMap;
