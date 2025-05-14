
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Flag, Map, Loader, X, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
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
  latitude?: number;
  longitude?: number;
}

const CoursesMap = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const popups = useRef<any[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);

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

      // Add geocoding for each course based on its address
      // In a production app, you'd store lat/lng in the database
      return data.map(course => {
        // For demonstration purposes, let's create deterministic but realistic coordinates
        // based on the course name (in a real app, you'd use the actual coordinates)
        const nameHash = course.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        // Generate coordinates within continental US
        const baseLat = 37.0902; // Base latitude (center of US)
        const baseLng = -95.7129; // Base longitude (center of US)
        
        // Vary by +/- 10 degrees based on course name hash
        const latOffset = (nameHash % 20) - 10;
        const lngOffset = ((nameHash * 13) % 30) - 15;
        
        return {
          ...course,
          latitude: baseLat + latOffset * 0.3,
          longitude: baseLng + lngOffset * 0.7
        };
      });
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
      
      // Use the provided Mapbox token
      window.mapboxgl.accessToken = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';
      
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

  // Clean up any previously created popups
  const cleanupPopups = () => {
    popups.current.forEach(popup => popup.remove());
    popups.current = [];
  };

  // Add markers when courses data is available
  const addMarkersToMap = () => {
    if (!mapInstance.current || !courses || !window.mapboxgl) return;
    
    // Clear existing markers and popups
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    cleanupPopups();
    
    // Determine whether a course is "open" or "closed" (randomly for demo)
    const getRandomStatus = () => Math.random() > 0.5 ? 'Open' : 'Closed';
    
    // Add markers for each course
    courses.forEach(course => {
      if (!course.latitude || !course.longitude) return;
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'course-marker';
      el.innerHTML = `<div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/90 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flag"><path d="M4 15s1-1 4-1 5 1 8 0 4-1 4-1V3s-1 1-4 1-5-1-8 0-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
      </div>`;
      
      // Create popup for the marker
      const isOpen = getRandomStatus();
      const popup = new window.mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
        maxWidth: '240px',
        className: 'custom-popup'
      });
      
      popup.setHTML(`
        <div class="p-3 bg-white rounded-lg shadow-lg min-w-40">
          <div class="font-medium text-sm mb-1">${course.name}</div>
          <div class="flex items-center text-xs mb-2 ${isOpen === 'Open' ? 'text-green-600' : 'text-red-600'}">
            <span class="mr-1">●</span>
            ${isOpen}
          </div>
          <button 
            class="course-btn w-full text-xs bg-primary text-white py-1 px-2 rounded hover:bg-primary/90 transition-colors"
            data-id="${course.id}"
          >
            Go to course
          </button>
        </div>
      `);
      
      // Save popup reference
      popups.current.push(popup);
      
      // Add marker to map
      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([course.longitude, course.latitude])
        .addTo(mapInstance.current);
      
      // Add click event to marker
      el.addEventListener('click', () => {
        // Close all other popups
        popups.current.forEach(p => {
          if (p !== popup) {
            p.remove();
          }
        });
        
        // Toggle this popup
        marker.setPopup(popup);
        marker.togglePopup();
        
        // Add navigation to the course page when clicking the button
        // We need to do this after the popup is in the DOM
        setTimeout(() => {
          const btn = document.querySelector(`.course-btn[data-id="${course.id}"]`);
          if (btn) {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              navigate(`/course/${course.id}`);
            });
          }
        }, 10);
      });
      
      // Save marker reference
      markers.current.push(marker);
    });
  };
  
  // Update markers when courses data changes
  useEffect(() => {
    if (courses && courses.length > 0 && mapInstance.current) {
      addMarkersToMap();
    }
  }, [courses]);

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
      
      <style jsx>{`
        .mapboxgl-ctrl-attrib-inner {
          display: none;
        }
        
        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .mapboxgl-popup-tip {
          display: none;
        }

        /* Hide browser navigation tab bar on mobile */
        @media screen and (max-width: 768px) {
          html {
            height: 100%;
            overflow: hidden;
          }
          body {
            height: 100%;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
};

export default CoursesMap;
