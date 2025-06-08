
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Map, Search, X, Loader } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { CourseMarker } from "@/components/map/CourseMarker";
import { CoursePopup } from "@/components/map/CoursePopup";
import { getGolfCourseCoordinates, getCourseStatus } from "@/utils/geocoding";

interface GolfCourse {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  image_url: string | null;
  par: number | null;
  holes: number;
  phone?: string | null;
  website?: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [mapInitialized, setMapInitialized] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Prevent pull-to-refresh behavior
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.top = '0';
    document.body.style.left = '0';
    
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
        .select("id, name, address, city, state, image_url, par, holes, phone, website")
        .order("name");

      if (error) {
        console.error("Error fetching courses:", error);
        throw error;
      }

      // Assign accurate coordinates to each course
      return data.map(course => {
        const coordinates = getGolfCourseCoordinates(course.name, course.address || undefined);
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

  // Load Mapbox scripts
  useEffect(() => {
    const loadMapboxResources = () => {
      if (window.mapboxgl || document.getElementById('mapbox-script') || scriptLoaded) {
        setScriptLoaded(true);
        return Promise.resolve();
      }

      const script = document.createElement('script');
      script.id = 'mapbox-script';
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = true;
      script.defer = true;
      
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
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || mapInitialized || !window.mapboxgl) return;
    
    try {
      console.log("Initializing map with Mapbox GL JS");
      
      window.mapboxgl.accessToken = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';
      
      mapInstance.current = new window.mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-58.56, -34.52],
        zoom: 10.5,
        attributionControl: false,
        dragRotate: false,
        touchZoomRotate: {
          around: 'center',
          pinchRotate: false
        },
        renderWorldCopies: false,
        failIfMajorPerformanceCaveat: false
      });
      
      mapInstance.current.addControl(
        new window.mapboxgl.NavigationControl({
          showCompass: false,
          visualizePitch: false
        }),
        'bottom-right'
      );
      
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
        
        // Add markers for each course
        courses.forEach(course => {
          if (!course.latitude || !course.longitude) {
            console.log(`No coordinates for ${course.name}`);
            return;
          }
          
          try {
            console.log(`Adding marker for ${course.name} at ${course.latitude}, ${course.longitude}`);
            
            // Get course status
            const isOpen = getCourseStatus(course.id);
            
            // Create custom marker element using React component
            const el = document.createElement('div');
            
            // Create popup content
            const popup = new window.mapboxgl.Popup({
              offset: [0, -15],
              closeButton: true,
              closeOnClick: false,
              className: 'custom-popup',
              maxWidth: '320px'
            }).setLngLat([course.longitude, course.latitude]);
            
            // Add marker to map
            const marker = new window.mapboxgl.Marker(el)
              .setLngLat([course.longitude, course.latitude])
              .addTo(mapInstance.current);
            
            // Render marker
            const markerComponent = CourseMarker({
              course,
              isOpen,
              onClick: (e) => {
                e?.preventDefault();
                e?.stopPropagation();
                
                // Close all other popups
                popups.current.forEach(p => p.remove());
                popups.current = [];
                
                // Create popup content HTML
                const popupContent = document.createElement('div');
                popupContent.innerHTML = `
                  <div class="course-popup-content" data-course-id="${course.id}">
                    <div class="relative h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                      <img 
                        src="${course.image_url || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}" 
                        alt="${course.name}"
                        class="w-full h-full object-cover"
                        onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';"
                      />
                      <div class="absolute top-2 right-2">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                          <span class="w-2 h-2 mr-1 rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'}"></span>
                          ${isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>
                    
                    <div class="p-4 space-y-3">
                      <div>
                        <h3 class="font-semibold text-lg leading-tight">${course.name}</h3>
                        <div class="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 15s1-1 4-1 5 1 8 0 4-1 4-1V3s-1 1-4 1-5-1-8 0-4 1-4 1z"></path>
                            <line x1="4" x2="4" y1="22" y2="15"></line>
                          </svg>
                          <span>${course.holes} holes</span>
                          ${course.par ? `<span>• Par ${course.par}</span>` : ''}
                        </div>
                      </div>
                      
                      ${(course.address || course.city) ? `
                        <div class="flex items-start gap-2 text-sm text-gray-600">
                          <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <span class="line-clamp-2">
                            ${[course.address, course.city, course.state].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      ` : ''}
                      
                      <div class="flex gap-2">
                        ${course.phone ? `
                          <button class="course-phone-btn flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1" data-phone="${course.phone}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            Call
                          </button>
                        ` : ''}
                        
                        ${course.website ? `
                          <button class="course-website-btn flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1" data-website="${course.website}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                            </svg>
                            Website
                          </button>
                        ` : ''}
                      </div>
                      
                      <button class="course-details-btn w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700" data-course-id="${course.id}">
                        View Course Details
                      </button>
                    </div>
                  </div>
                `;
                
                popup.setDOMContent(popupContent);
                popup.addTo(mapInstance.current);
                popups.current.push(popup);
                
                // Add event listeners after popup is added
                setTimeout(() => {
                  const phoneBtn = popupContent.querySelector('.course-phone-btn');
                  const websiteBtn = popupContent.querySelector('.course-website-btn');
                  const detailsBtn = popupContent.querySelector('.course-details-btn');
                  
                  if (phoneBtn) {
                    phoneBtn.addEventListener('click', (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(`tel:${course.phone}`, '_blank');
                    });
                  }
                  
                  if (websiteBtn) {
                    websiteBtn.addEventListener('click', (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(course.website, '_blank');
                    });
                  }
                  
                  if (detailsBtn) {
                    detailsBtn.addEventListener('click', (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/course/${course.id}`);
                    });
                  }
                }, 10);
              }
            });
            
            // Render the marker component to the DOM element
            el.innerHTML = `
              <div class="relative cursor-pointer transform transition-transform hover:scale-110 active:scale-95">
                <div class="w-10 h-10 rounded-full shadow-lg border-2 flex items-center justify-center ${isOpen 
                  ? 'bg-green-500 border-green-600 text-white' 
                  : 'bg-red-500 border-red-600 text-white'
                } hover:shadow-xl transition-all duration-200">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 15s1-1 4-1 5 1 8 0 4-1 4-1V3s-1 1-4 1-5-1-8 0-4 1-4 1z"></path>
                    <line x1="4" x2="4" y1="22" y2="15"></line>
                  </svg>
                </div>
                <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isOpen ? 'bg-green-400' : 'bg-red-400'}"></div>
              </div>
            `;
            
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
    
    setTimeout(addMarkersToMap, 200);
    
  }, [courses, mapLoaded, navigate]);
  
  // Apply search filter to markers
  useEffect(() => {
    if (!mapInstance.current || !markers.current.length || !courses) return;
    
    const filteredIds = filteredCourses.map(course => course.id);
    
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

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        const searchInput = document.getElementById('course-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    } else {
      setSearchQuery('');
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRetryMap = () => {
    if (mapInstance.current) {
      try {
        mapInstance.current.remove();
      } catch (e) {
        console.error("Error removing map on retry:", e);
      }
      mapInstance.current = null;
    }
    
    setMapInitialized(false);
    setMapLoaded(false);
    setMapError(null);
    setScriptLoaded(false);
    
    const oldScript = document.getElementById('mapbox-script');
    if (oldScript) document.head.removeChild(oldScript);
    
    toast({
      title: "Retrying",
      description: "Trying to load the map again...",
    });
  };
  
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (e) {
          console.error("Error cleaning up map:", e);
        }
        mapInstance.current = null;
      }
      
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
        <div 
          ref={mapRef} 
          className="w-full h-full"
          id="map-container"
        />
        
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
        
        <div className="absolute bottom-1 right-1 text-[8px] text-muted-foreground bg-white/80 px-1 rounded">
          © Mapbox © OpenStreetMap
        </div>
      </div>
      
      <style>
        {`
          .mapboxgl-ctrl-attrib-inner { display: none; }
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
          .mapboxgl-popup-tip { display: none; }
          .custom-popup { z-index: 10; }
          @media screen and (max-width: 768px) {
            html, body, #root {
              height: 100vh !important; 
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
          .mapboxgl-map { touch-action: none !important; }
          .mapboxgl-popup { max-width: none !important; }
          .mapboxgl-popup-content { pointer-events: auto !important; }
        `}
      </style>
    </div>
  );
};

export default CoursesMap;
