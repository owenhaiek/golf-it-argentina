
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Flag, Map, Loader, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";

interface GolfCourse {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  image_url: string | null;
  par: number | null;
  holes: number;
}

const CoursesMap = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: courses, isLoading } = useQuery<GolfCourse[]>({
    queryKey: ["all-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("golf_courses")
        .select("id, name, address, city, state, image_url, par, holes")
        .order("name");

      if (error) {
        console.error("Error fetching courses:", error);
        throw error;
      }

      return data || [];
    }
  });

  // Map initialization
  useEffect(() => {
    // Check if map script is already loaded
    if (!window.mapboxgl) {
      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
      script.async = true;
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);

      script.onload = initializeMap;
      
      return () => {
        document.head.removeChild(script);
        document.head.removeChild(link);
      }
    } else {
      initializeMap();
    }
    
    function initializeMap() {
      if (!mapRef.current || !window.mapboxgl || mapInstance.current) return;
      
      // Replace with your actual Mapbox token (NOTE: Ideally this should be in env vars)
      window.mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZWRlbW8iLCJhIjoiY2xzN3U3YnFhMDJrMTJrcGlhZnp4bGJtcCJ9.LgTkDG2CQlgLrGWDLrV7vQ';
      
      // Initialize map
      mapInstance.current = new window.mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-95.7129, 37.0902], // Center of US
        zoom: 3,
        attributionControl: false
      });
      
      // Add controls
      mapInstance.current.addControl(new window.mapboxgl.NavigationControl(), 'bottom-right');
      
      // Add markers when map is loaded
      mapInstance.current.on('load', () => {
        addMarkersToMap();
      });
    }
  }, []);

  // Add markers when courses data is available
  const addMarkersToMap = () => {
    if (!mapInstance.current || !courses || !window.mapboxgl) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Add markers for each course
    courses.forEach(course => {
      // In a real app, you'd have lat/lng coordinates for each course
      // Here we're using random coordinates across the US for demo purposes
      const lat = 35 + (Math.random() * 10) - 5;
      const lng = -100 + (Math.random() * 40) - 20;
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'course-marker';
      el.innerHTML = `<div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/90 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flag"><path d="M4 15s1-1 4-1 5 1 8 0 4-1 4-1V3s-1 1-4 1-5-1-8 0-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
      </div>`;
      
      // Add marker to map
      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(mapInstance.current);
        
      // Add click event to marker
      el.addEventListener('click', () => {
        setSelectedCourse(course);
        setIsSheetOpen(true);
      });
      
      // Save marker reference for later cleanup
      markers.current.push(marker);
    });
  };
  
  // Update markers when courses data changes
  useEffect(() => {
    if (courses && courses.length > 0 && mapInstance.current) {
      addMarkersToMap();
    }
  }, [courses]);
  
  const handleCourseSelect = (course: GolfCourse) => {
    navigate(`/course/${course.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn relative min-h-screen">
      <div className="flex items-center mb-6 gap-2 px-4">
        <Map className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-bold text-primary">{t("map", "golfCoursesMap")}</h1>
        {isLoading && (
          <div className="ml-auto">
            <Loader className="h-5 w-5 text-primary animate-spin" />
          </div>
        )}
      </div>
      
      <div className="relative h-[calc(100vh-180px)] mx-4 rounded-xl overflow-hidden shadow-lg border border-muted/20 bg-muted/10">
        {/* Map Container */}
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm font-medium">{t("common", "loading")}...</p>
            </div>
          </div>
        )}
        
        {/* Map Attribution */}
        <div className="absolute bottom-1 right-1 text-[8px] text-muted-foreground bg-white/80 px-1 rounded">
          © Mapbox © OpenStreetMap
        </div>
      </div>
      
      {/* Course Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full rounded-t-xl sm:max-w-md pt-safe">
          <SheetHeader className="pt-6">
            <SheetTitle className="text-lg font-medium">{selectedCourse?.name}</SheetTitle>
            <SheetDescription>
              {selectedCourse?.city ? `${selectedCourse?.city}, ${selectedCourse?.state}` : null}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-4">
            {selectedCourse && (
              <div className="space-y-4">
                <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                  {selectedCourse.image_url ? (
                    <img 
                      src={selectedCourse.image_url} 
                      alt={selectedCourse.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Flag className="h-10 w-10 text-primary/30" />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("map", "holes")}</p>
                    <p className="font-medium">{selectedCourse.holes}</p>
                  </div>
                  {selectedCourse.par && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t("map", "par")}</p>
                      <p className="font-medium">{selectedCourse.par}</p>
                    </div>
                  )}
                  <div>
                    <Button 
                      onClick={() => handleCourseSelect(selectedCourse)}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      {t("map", "viewCourse")}
                    </Button>
                  </div>
                </div>
                
                {selectedCourse.address && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>{selectedCourse.address}</p>
                    <p>{selectedCourse.city}, {selectedCourse.state}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      <style>{`
        .mapboxgl-ctrl-attrib-inner {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CoursesMap;
