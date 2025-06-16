
import { useEffect, useState, MutableRefObject } from "react";

interface UseMapboxOptions {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  onMapLoaded?: (mapInstance: any) => void;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
}

export function useMapbox({
  containerRef,
  onMapLoaded,
  center = [-58.3816, -34.6118],
  zoom = 6,
  accessToken,
}: UseMapboxOptions) {
  const [map, setMap] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Load Mapbox scripts
  useEffect(() => {
    let cancelled = false;

    const loadMapboxResources = async () => {
      try {
        // Check if already loaded
        if ((window as any).mapboxgl) {
          if (!cancelled) setScriptsLoaded(true);
          return;
        }

        console.log("[Map] Loading Mapbox resources...");

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
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => {
              console.log("[Map] Script loaded");
              resolve();
            };
            script.onerror = () => {
              console.error("[Map] Script failed to load");
              reject(new Error("Failed to load Mapbox script"));
            };
            document.head.appendChild(script);
          });
        }

        // Wait for mapboxgl to be available
        let attempts = 0;
        while (!(window as any).mapboxgl && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if ((window as any).mapboxgl) {
          console.log("[Map] Mapbox GL available");
          if (!cancelled) setScriptsLoaded(true);
        } else {
          throw new Error("Mapbox GL failed to initialize");
        }
      } catch (error) {
        console.error("[Map] Error loading resources:", error);
        if (!cancelled) setInitError("Failed to load map resources");
      }
    };

    loadMapboxResources();

    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!scriptsLoaded || !containerRef.current || !accessToken || map) {
      return;
    }

    console.log("[Map] Initializing map...");
    
    let mapInstance: any = null;
    let cancelled = false;

    try {
      (window as any).mapboxgl.accessToken = accessToken;
      
      mapInstance = new (window as any).mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center,
        zoom,
        attributionControl: false,
      });

      // Add controls
      mapInstance.addControl(
        new (window as any).mapboxgl.NavigationControl({ showCompass: false }),
        'bottom-right'
      );

      mapInstance.on('load', () => {
        console.log("[Map] Map loaded successfully");
        if (!cancelled) {
          setMapLoaded(true);
          setMap(mapInstance);
          if (onMapLoaded) onMapLoaded(mapInstance);
        }
      });

      mapInstance.on('error', (e: any) => {
        console.error("[Map] Map error:", e);
        if (!cancelled) {
          setInitError("Map failed to load");
          setMapLoaded(false);
        }
      });

      // Set initial reference
      setMap(mapInstance);

    } catch (error: any) {
      console.error("[Map] Error initializing map:", error);
      if (!cancelled) {
        setInitError("Failed to initialize map");
        setMapLoaded(false);
      }
    }

    return () => {
      cancelled = true;
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (e) {
          console.error("[Map] Error removing map:", e);
        }
      }
      setMap(null);
      setMapLoaded(false);
    };
  }, [scriptsLoaded, containerRef, accessToken, center, zoom]);

  return { map, mapLoaded, scriptsLoaded, initError };
}
