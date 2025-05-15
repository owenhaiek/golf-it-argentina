
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flag, Map, Loader, X, Clock, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [mapInitialized, setMapInitialized] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadRetries, setLoadRetries] = useState(0);

  // Prevent the pull-to-refresh behavior as soon as component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.top = '0';
    document.body.style.left = '0';
    
    // Set meta viewport to prevent zooming
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
      document.body.style.left = '';
      
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    };
  }, []);

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

  // Filter courses based on search query
  const filteredCourses = courses?.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Helper function to return real golf course coordinates in Argentina
  const getArgentinaGolfCourseLocation = (courseName: string) => {
    // Map of real golf courses in Argentina with actual coordinates
    const argentinaGolfCourses = {
      // Buenos Aires Province
      "BOULOGNE GOLF CLUB": { lat: -34.4844, lng: -58.5563 }, 
      "BUENOS AIRES GOLF CLUB": { lat: -34.5446, lng: -58.6741 },
      "PACHECO GOLF CLUB": { lat: -34.4208, lng: -58.6483 },
      "Olivos Golf Club": { lat: -34.5104, lng: -58.5220 },
      "Pilar Golf Club": { lat: -34.4255, lng: -58.8940 },
      "Jockey Club": { lat: -34.5442, lng: -58.5045 },
      "Mar del Plata Golf Club": { lat: -38.0160, lng: -57.5327 },
      "Nordelta Golf Club": { lat: -34.4019, lng: -58.6309 },
      "Highland Park Country Club": { lat: -34.4701, lng: -58.7528 },
      "San Andrés Golf Club": { lat: -34.5087, lng: -58.6102 },
      "Hurlingham Club": { lat: -34.6016, lng: -58.6390 },
      "Pilará Golf Club": { lat: -34.4322, lng: -58.9603 },
      "Tortugas Country Club": { lat: -34.4385, lng: -58.8067 },
      
      // Interior provinces
      "Córdoba Golf Club": { lat: -31.4177, lng: -64.2390 },
      "Chapelco Golf Club": { lat: -40.1564, lng: -71.3051 },
      "La Cumbre Golf Club": { lat: -30.9709, lng: -64.4949 },
      "Mendoza Golf Club": { lat: -32.9689, lng: -68.7908 },
      "Llao Llao Golf Club": { lat: -41.0531, lng: -71.5356 },
      "Arelauquen Golf Club": { lat: -41.1171, lng: -71.5679 },
      "Termas de Río Hondo Golf Club": { lat: -27.5016, lng: -64.8575 }
    };
    
    // First check for exact match (case insensitive)
    const exactMatch = Object.keys(argentinaGolfCourses).find(name => 
      name.toLowerCase() === courseName.toLowerCase()
    );
    
    if (exactMatch) {
      return argentinaGolfCourses[exactMatch as keyof typeof argentinaGolfCourses];
    }
    
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
    const index = nameHash % fallbackLocations.length;
    const baseLocation = fallbackLocations[index];
    
    // Add small variation so points don't overlap
    const latVariation = ((nameHash % 100) / 5000) * (nameHash % 2 === 0 ? 1 : -1);
    const lngVariation = ((nameHash * 7 % 100) / 5000) * (nameHash % 3 === 0 ? 1 : -1);
    
    return {
      lat: baseLocation.lat + latVariation,
      lng: baseLocation.lng + lngVariation
    };
  };

  // Load Mapbox scripts separately
  useEffect(() => {
    const loadMapboxResources = () => {
      // Skip if already loaded
      if (window.mapboxgl || document.getElementById('mapbox-script') || scriptLoaded) {
        setScriptLoaded(true);
        return Promise.resolve();
      }

      // Create and load script
      const script = document.createElement('script');
      script.id = 'mapbox-script';
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = true;
      script.defer = true;
      
      // Create and load CSS
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      
      document.head.appendChild(link);
      
      return new Promise<void>((resolve, reject) => {
        script.onload = () => {
          console.log('Mapbox script loaded successfully');
          setScriptLoaded(true);
          resolve();
        };
        
        script.onerror = (e) => {
          console.error('Error loading Mapbox script:', e);
          reject(new Error('Failed to load Mapbox GL JS'));
        };
        
        document.head.appendChild(script);
      });
    };

    loadMapboxResources().catch(err => {
      console.error('Failed to load Mapbox resources:', err);
      setMapError('Could not load map resources. Please check your connection.');
      
      // Auto retry up to 3 times
      const retryCount = loadRetries + 1;
      if (retryCount <= 3) {
        console.log(`Retrying to load Mapbox (attempt ${retryCount})...`);
        setLoadRetries(retryCount);
        
        // Try again after a delay
        setTimeout(() => {
          const oldScript = document.getElementById('mapbox-script');
          if (oldScript) document.head.removeChild(oldScript);
          
          loadMapboxResources().catch(e => {
            console.error(`Retry ${retryCount} failed:`, e);
            if (retryCount === 3) {
              setMapError('Could not load map after multiple attempts. Please refresh the page.');
              toast({
                title: "Map error",
                description: "Failed to load the map resources. Please refresh the page.",
                variant: "destructive"
              });
            }
          });
        }, 2000);
      }
    });
  }, [loadRetries]);

  // Map initialization with optimized setup - only after script is loaded
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || mapInitialized || !window.mapboxgl) return;
    
    try {
      console.log("Initializing map with Mapbox GL JS");
      
      // Set access token
      window.mapboxgl.accessToken = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';
      
      // Initialize map centered better on Buenos Aires area golf courses
      mapInstance.current = new window.mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-58.56, -34.52], // Optimized center for all three specific golf courses
        zoom: 10.5, // Better zoom level for viewing
        attributionControl: false,
        dragRotate: false, // Disable rotation for better mobile experience
        touchZoomRotate: {
          around: 'center',
          pinchRotate: false
        },
        renderWorldCopies: false,
        failIfMajorPerformanceCaveat: false // Allow fallback to lower performance
      });
      
      // Add minimal controls
      mapInstance.current.addControl(
        new window.mapboxgl.NavigationControl({
          showCompass: false,
          visualizePitch: false
        }),
        'bottom-right'
      );
      
      // Add markers when map is loaded
      mapInstance.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        setMapError(null);
      });
      
      mapInstance.current.on('error', (e: any) => {
        console.error("Map error:", e);
        setMapError("There was a problem with the map. Please try again.");
      });
      
      setMapInitialized(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError("Could not initialize map. Please try again or refresh the page.");
      
      // Clean up if initialization fails
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
          mapInstance.current = null;
        } catch (e) {
          console.error("Error cleaning up map after initialization failure:", e);
        }
      }
    }
  }, [scriptLoaded, mapRef.current]);
  
  // Add markers when map is loaded and courses data is available
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !courses || !courses.length || !window.mapboxgl) {
      return;
    }
    
    const addMarkersToMap = () => {
      try {
        // Clear existing markers and popups
        markers.current.forEach(marker => {
          try {
            marker.remove();
          } catch (e) {
            console.error("Error removing marker:", e);
          }
        });
        markers.current = [];
        
        popups.current.forEach(popup => {
          try {
            popup.remove();
          } catch (e) {
            console.error("Error removing popup:", e);
          }
        });
        popups.current = [];
        
        console.log(`Adding ${courses.length} markers to map`);
        
        // Determine whether a course is "open" or "closed" (randomly for demo)
        const getRandomStatus = (courseId: string) => {
          // Use course ID to generate consistent status
          const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          return hash % 3 !== 0 ? 'Open' : 'Closed'; // 2/3 chance of being open
        };
        
        // Add markers for each course
        courses.forEach(course => {
          if (!course.latitude || !course.longitude) {
            console.log(`No coordinates for ${course.name}`);
            return;
          }
          
          try {
            console.log(`Adding marker for ${course.name} at ${course.latitude}, ${course.longitude}`);
            
            // Create custom marker element
            const el = document.createElement('div');
            el.className = 'course-marker';
            el.innerHTML = `<div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/90 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flag"><path d="M4 15s1-1 4-1 5 1 8 0 4-1 4-1V3s-1 1-4 1-5-1-8 0-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
            </div>`;
            
            // Create popup for the marker
            const isOpen = getRandomStatus(course.id);
            
            const defaultImageUrl = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80';
            
            const popup = new window.mapboxgl.Popup({
              offset: [0, -15],
              closeButton: true,
              closeOnClick: false,
              className: 'custom-popup',
              maxWidth: '280px'
            }).setLngLat([course.longitude, course.latitude])
              .setHTML(`
                <div class="p-3 bg-white rounded-lg shadow-sm min-w-[240px] text-sm">
                  <div class="h-32 w-full mb-3 bg-gray-100 rounded-md overflow-hidden relative">
                    <img 
                      src="${course.image_url || defaultImageUrl}" 
                      alt="${course.name}"
                      class="w-full h-full object-cover"
                      onerror="this.onerror=null; this.src='${defaultImageUrl}';"
                    />
                  </div>
                  <div class="font-medium text-lg mb-2">${course.name}</div>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center ${isOpen === 'Open' ? 'text-green-600' : 'text-red-600'}">
                      <span class="mr-1">●</span>
                      ${isOpen}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      ${course.holes} hoyos
                    </div>
                  </div>
                  <div class="text-xs text-muted-foreground mb-3 line-clamp-2">
                    ${course.address ? course.address : ''} 
                    ${course.city ? course.city + (course.state ? ', ' + course.state : '') : ''}
                  </div>
                  <button 
                    class="course-btn w-full bg-primary text-white py-2 px-3 rounded hover:bg-primary/90 transition-colors text-sm font-medium"
                    data-id="${course.id}"
                  >
                    Ir a la cancha
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
              popups.current.forEach(p => p.remove());
              popups.current = [];
              
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
          } catch (e) {
            console.error(`Error creating marker for ${course.name}:`, e);
          }
        });
      } catch (error) {
        console.error("Error adding markers to map:", error);
        toast({
          title: "Warning",
          description: "Some course locations could not be displayed",
          variant: "default"
        });
      }
    };
    
    // Add markers with a small delay to ensure map is fully ready
    setTimeout(addMarkersToMap, 200);
    
  }, [courses, mapLoaded, navigate]);
  
  // Apply search filter to markers
  useEffect(() => {
    if (!mapInstance.current || !markers.current.length || !courses) return;
    
    // Filter courses based on search query
    const filteredIds = filteredCourses.map(course => course.id);
    
    // Update markers visibility based on filter
    markers.current.forEach((marker, index) => {
      if (index < courses.length) {
        const course = courses[index];
        if (filteredIds.includes(course.id) || searchQuery === '') {
          marker.getElement().style.display = 'block';
        } else {
          marker.getElement().style.display = 'none';
        }
      }
    });
    
  }, [filteredCourses, searchQuery, courses]);

  // Handle search icon click
  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      // Focus the input when search is shown
      setTimeout(() => {
        const searchInput = document.getElementById('course-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    } else {
      // Clear search when hiding
      setSearchQuery('');
    }
  };
  
  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Retry mechanism for map if it fails to load
  const handleRetryMap = () => {
    // Clean up existing map instance
    if (mapInstance.current) {
      try {
        mapInstance.current.remove();
      } catch (e) {
        console.error("Error removing map on retry:", e);
      }
      mapInstance.current = null;
    }
    
    // Reset all map-related state
    setMapInitialized(false);
    setMapLoaded(false);
    setMapError(null);
    setScriptLoaded(false);
    
    // Remove any existing script tag
    const oldScript = document.getElementById('mapbox-script');
    if (oldScript) document.head.removeChild(oldScript);
    
    // Reset the retry counter
    setLoadRetries(0);
    
    // Toast notification
    toast({
      title: "Retrying",
      description: "Trying to load the map again...",
    });
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up map instance
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (e) {
          console.error("Error cleaning up map:", e);
        }
        mapInstance.current = null;
      }
      
      // Clean up script tag
      const mapboxScript = document.getElementById('mapbox-script');
      if (mapboxScript) {
        mapboxScript.remove();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 animate-fadeIn flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-between p-4 pt-safe">
        <div className="flex items-center">
          <Map className="text-primary h-6 w-6" />
          <h1 className="text-2xl font-bold text-primary ml-2">{t("map", "golfCoursesMap")}</h1>
        </div>
        
        {/* Search button and slide-down input */}
        <div className="relative">
          <button 
            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            onClick={handleSearchToggle}
          >
            <Search className="h-5 w-5 text-primary" />
          </button>
          
          <AnimatePresence>
            {showSearch && (
              <motion.div 
                className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-20"
                initial={{ opacity: 0, y: -10, width: 40 }}
                animate={{ opacity: 1, y: 0, width: 240 }}
                exit={{ opacity: 0, y: -10, width: 40 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative p-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="course-search-input"
                    type="text"
                    placeholder="Search courses"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-8 pr-8 h-9 text-sm"
                  />
                  {searchQuery && (
                    <button 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2" 
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="absolute inset-0 pt-16">
        {/* Map Container */}
        <div 
          ref={mapRef} 
          className="w-full h-full"
          id="map-container"
        />
        
        {/* Loading Overlay */}
        {(!mapLoaded || isLoading) && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <Map className="absolute inset-0 w-6 h-6 m-auto text-primary/70" />
              </div>
              <p className="text-sm font-medium">{t("common", "loading")}...</p>
            </div>
          </div>
        )}
        
        {/* Error state with retry button */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 max-w-xs text-center px-6">
              <Map className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-destructive">{mapError}</p>
              <Button onClick={handleRetryMap} variant="outline" className="mt-2">
                Try Again
              </Button>
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
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(229, 231, 235, 0.5);
          }
          
          .mapboxgl-popup-close-button {
            font-size: 16px;
            padding: 0 6px;
            color: #666;
            top: 8px;
            right: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.8);
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
          }
          
          .mapboxgl-popup-close-button:hover {
            background: rgba(229, 231, 235, 1);
          }
          
          .mapboxgl-popup-tip {
            display: none;
          }

          .custom-popup {
            z-index: 10;
          }

          /* Hide browser navigation tab bar on mobile */
          @media screen and (max-width: 768px) {
            html, body, #root {
              height: 100vh; 
              overflow: hidden !important;
              position: fixed !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-overflow-scrolling: touch !important;
              touch-action: none !important;
              overscroll-behavior: none !important;
            }
          }
          
          .mapboxgl-map {
            touch-action: none !important;
          }
          
          .mapboxgl-popup {
            max-width: none !important;
          }
          
          /* Ensure popups are clickable */
          .mapboxgl-popup-content {
            pointer-events: auto !important;
          }
        `}
      </style>
    </div>
  );
};

export default CoursesMap;
