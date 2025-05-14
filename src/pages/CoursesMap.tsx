
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
  
  const [mapLoaded, setMapLoaded] = useState(false);
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

      // Generate real Argentina coordinates for golf courses
      return data.map(course => {
        // Set real Argentinian golf course locations
        let coordinates = getArgentinaGolfCourseLocation(course.name);
        return {
          ...course,
          latitude: coordinates.lat,
          longitude: coordinates.lng
        };
      });
    }
  });

  // Helper function to return real golf course coordinates in Argentina
  const getArgentinaGolfCourseLocation = (courseName: string) => {
    // Map of real golf courses in Argentina with actual coordinates
    const argentinaGolfCourses = {
      "Buenos Aires Golf Club": { lat: -34.4851, lng: -58.5213 },
      "Olivos Golf Club": { lat: -34.5104, lng: -58.5220 },
      "Pilar Golf Club": { lat: -34.4255, lng: -58.8940 },
      "Jockey Club": { lat: -34.5442, lng: -58.5045 },
      "Mar del Plata Golf Club": { lat: -38.0160, lng: -57.5327 },
      "Córdoba Golf Club": { lat: -31.4177, lng: -64.2390 },
      "Nordelta Golf Club": { lat: -34.4019, lng: -58.6309 },
      "Chapelco Golf Club": { lat: -40.1564, lng: -71.3051 },
      "Highland Park Country Club": { lat: -34.4701, lng: -58.7528 },
      "San Andrés Golf Club": { lat: -34.5087, lng: -58.6102 }
    };
    
    // For demo purposes, if the course isn't in our list, give it a reasonable location in Argentina
    const fallbackLocations = [
      { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
      { lat: -31.4201, lng: -64.1888 }, // Cordoba
      { lat: -32.8908, lng: -68.8272 }, // Mendoza
      { lat: -38.0055, lng: -57.5426 }, // Mar del Plata
      { lat: -34.5553, lng: -58.4964 }, // Belgrano
      { lat: -34.4446, lng: -58.8730 }, // Pilar
      { lat: -34.4806, lng: -58.5317 }, // San Isidro
      { lat: -33.2971, lng: -66.3356 }, // San Luis
    ];
    
    // Generate a consistent hash based on course name for predictable "random" location
    const nameHash = courseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Either return the real coordinates or a fallback location
    const knownCourse = Object.keys(argentinaGolfCourses).find(name => 
      courseName.toLowerCase().includes(name.toLowerCase())
    );
    
    if (knownCourse) {
      return argentinaGolfCourses[knownCourse as keyof typeof argentinaGolfCourses];
    } else {
      const index = nameHash % fallbackLocations.length;
      const baseLocation = fallbackLocations[index];
      
      // Add small variation so points don't overlap
      const latVariation = ((nameHash % 100) / 5000) * (nameHash % 2 === 0 ? 1 : -1);
      const lngVariation = ((nameHash * 7 % 100) / 5000) * (nameHash % 3 === 0 ? 1 : -1);
      
      return {
        lat: baseLocation.lat + latVariation,
        lng: baseLocation.lng + lngVariation
      };
    }
  };

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
      
      // Initialize map centered on Argentina
      mapInstance.current = new window.mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-58.3816, -34.6037], // Center on Buenos Aires, Argentina
        zoom: 5,
        attributionControl: false
      });
      
      // Add controls
      mapInstance.current.addControl(new window.mapboxgl.NavigationControl(), 'bottom-right');
      
      // Add markers when map is loaded
      mapInstance.current.on('load', () => {
        addMarkersToMap();
        setMapLoaded(true);
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
        offset: [0, -15],
        closeButton: true,
        closeOnClick: false,
        className: 'custom-popup',
        maxWidth: '200px'
      }).setLngLat([course.longitude, course.latitude])
        .setHTML(`
          <div class="p-2 bg-white rounded-lg shadow-sm min-w-[150px] text-xs">
            <div class="font-medium mb-1">${course.name}</div>
            <div class="flex items-center mb-1 ${isOpen === 'Open' ? 'text-green-600' : 'text-red-600'}">
              <span class="mr-1">●</span>
              ${isOpen}
            </div>
            <button 
              class="course-btn w-full bg-primary text-white py-1 px-2 rounded hover:bg-primary/90 transition-colors text-xs"
              data-id="${course.id}"
            >
              Go to course
            </button>
          </div>
        `);
      
      // Add marker to map
      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([course.longitude, course.latitude])
        .addTo(mapInstance.current);
      
      // Add click event to marker
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close all other popups
        cleanupPopups();
        
        // Add this popup to the map
        popup.addTo(mapInstance.current);
        
        // Add to popups reference for cleanup
        popups.current.push(popup);
        
        // Add navigation to the course page when clicking the button
        setTimeout(() => {
          const btn = document.querySelector(`.course-btn[data-id="${course.id}"]`);
          if (btn) {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
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
  
  // Disable pull-to-refresh and prevent scroll on this specific page
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };
    
    // Prevent touch move and wheel events to disable scroll
    document.body.addEventListener('touchmove', preventDefault, { passive: false });
    document.body.addEventListener('wheel', preventDefault, { passive: false });
    
    return () => {
      document.body.removeEventListener('touchmove', preventDefault);
      document.body.removeEventListener('wheel', preventDefault);
    };
  }, []);

  return (
    <div className="fixed inset-0 animate-fadeIn flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm flex items-center p-4 pt-safe">
        <Map className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-bold text-primary ml-2">{t("map", "golfCoursesMap")}</h1>
      </div>
      
      <div className="absolute inset-0 pt-16">
        {/* Map Container */}
        <div 
          ref={mapRef} 
          className="w-full h-full"
        />
        
        {/* Loading Overlay */}
        {(!mapLoaded || isLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin">
                <Map className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium">{t("common", "loading")}...</p>
            </div>
          </div>
        )}
        
        {/* Map Attribution */}
        <div className="absolute bottom-1 right-1 text-[8px] text-muted-foreground bg-white/80 px-1 rounded">
          © Mapbox © OpenStreetMap
        </div>
      </div>
      
      <style>
        {`
          .mapboxgl-ctrl-attrib-inner {
            display: none;
          }
          
          .mapboxgl-popup-content {
            padding: 0;
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(229, 231, 235, 0.5);
          }
          
          .mapboxgl-popup-close-button {
            font-size: 14px;
            padding: 0 4px;
            color: #666;
            top: 2px;
            right: 2px;
          }
          
          .mapboxgl-popup-tip {
            display: none;
          }

          .custom-popup {
            z-index: 10;
          }

          /* Hide browser navigation tab bar on mobile */
          @media screen and (max-width: 768px) {
            html {
              height: 100vh; 
              overflow: hidden;
              position: fixed;
              width: 100%;
            }
            body {
              height: 100vh;
              overflow: hidden;
              position: fixed;
              width: 100%;
              -webkit-overflow-scrolling: touch;
            }
            #root {
              height: 100%;
            }
          }
          
          .mapboxgl-map {
            touch-action: none;
          }
          
          .mapboxgl-popup {
            max-width: none !important;
          }
          
          /* Ensure popups are clickable */
          .mapboxgl-popup-content {
            pointer-events: auto !important;
          }
          
          /* Make the map take up the full screen */
          #root, body, html {
            height: 100% !important;
            overflow: hidden !important;
          }
          
          /* Stop scroll refresh */
          body {
            overscroll-behavior: none;
            overflow: hidden;
            position: fixed;
            width: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default CoursesMap;
