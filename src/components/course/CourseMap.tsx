
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Map, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface CourseMapProps {
  latitude?: number | null;
  longitude?: number | null;
  name?: string;
}

const MAPBOX_TOKEN = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';

export const CourseMap = ({ latitude, longitude, name }: CourseMapProps) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [scriptsReady, setScriptsReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Load Mapbox resources
  useEffect(() => {
    const loadMapboxResources = async () => {
      if (window.mapboxgl) {
        setScriptsReady(true);
        return;
      }

      try {
        // Load CSS
        if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
          const link = document.createElement('link');
          link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }

        // Load JS
        if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
          script.async = true;
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Wait for mapboxgl to be available
        let attempts = 0;
        while (!window.mapboxgl && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (window.mapboxgl) {
          setScriptsReady(true);
        } else {
          throw new Error("Mapbox GL failed to load");
        }
      } catch (error) {
        console.error('Error loading Mapbox:', error);
        setMapError('Failed to load map resources');
        setIsLoading(false);
      }
    };

    loadMapboxResources();
  }, []);
  
  // Initialize map when everything is ready
  useEffect(() => {
    if (!scriptsReady || !latitude || !longitude || !mapContainerRef.current || mapInstance) {
      return;
    }

    try {
      console.log(`Initializing course map for ${name}`);
      
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const map = new window.mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 15,
        attributionControl: false,
        dragRotate: false,
      });
      
      map.addControl(
        new window.mapboxgl.NavigationControl({
          showCompass: false,
        }),
        'bottom-right'
      );
      
      const marker = new window.mapboxgl.Marker({
        color: '#10b981',
      })
        .setLngLat([longitude, latitude])
        .addTo(map);
      
      new window.mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'bottom',
        offset: [0, -30],
      })
        .setLngLat([longitude, latitude])
        .setHTML(`<div class="font-medium text-xs">${name || 'Golf Course'}</div>`)
        .addTo(map);
      
      map.on('load', () => {
        console.log('Course map loaded successfully');
        setIsLoading(false);
      });
      
      map.on('error', (e) => {
        console.error('Course map error:', e);
        setMapError('Could not load map');
        setIsLoading(false);
      });
      
      setMapInstance(map);
    } catch (error) {
      console.error('Error initializing course map:', error);
      setMapError('Could not initialize map');
      setIsLoading(false);
    }
    
    return () => {
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
    };
  }, [scriptsReady, latitude, longitude, name]);
  
  // Handle missing location data
  if (!latitude || !longitude) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("course", "courseLocation")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MapPin className="h-12 w-12 mb-2 opacity-20" />
          <p>{t("course", "mapNotAvailable")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t("course", "courseLocation")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted h-[300px] rounded-md relative overflow-hidden">
          <div
            ref={mapContainerRef}
            className="absolute inset-0 w-full h-full"
          />
          
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-3 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-3 border-primary border-t-transparent animate-spin"></div>
                <Map className="absolute inset-0 w-5 h-5 m-auto text-primary/70" />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {!scriptsReady ? 'Loading map...' : 'Initializing...'}
              </p>
            </div>
          )}
          
          {/* Error state */}
          {mapError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
              <Globe className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
              <p className="text-muted-foreground mb-3">{mapError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                {t("common", "tryAgain")}
              </Button>
            </div>
          )}
          
          {/* Map attribution */}
          <div className="absolute bottom-1 right-1 text-[8px] text-muted-foreground bg-white/80 px-1 rounded">
            © Mapbox © OpenStreetMap
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseMap;
