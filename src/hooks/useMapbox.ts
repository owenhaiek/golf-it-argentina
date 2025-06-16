
import { useEffect, useState, MutableRefObject } from "react";

interface UseMapboxOptions {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
  onMapReady?: (map: any) => void;
}

export function useMapbox({
  containerRef,
  center = [-58.3816, -34.6118],
  zoom = 6,
  accessToken,
  onMapReady
}: UseMapboxOptions) {
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let mapInstance: any = null;

    const initializeMap = async () => {
      try {
        console.log("[Mapbox] Starting initialization...");
        
        if (!accessToken) {
          throw new Error("Mapbox access token is required");
        }

        if (!containerRef.current) {
          throw new Error("Map container is not available");
        }

        // Wait for container to be properly sized
        await new Promise(resolve => {
          const checkContainer = () => {
            if (containerRef.current && containerRef.current.offsetWidth > 0) {
              resolve(void 0);
            } else {
              setTimeout(checkContainer, 100);
            }
          };
          checkContainer();
        });

        if (cancelled) return;

        // Load Mapbox resources if not already loaded
        if (!(window as any).mapboxgl) {
          console.log("[Mapbox] Loading Mapbox GL JS...");
          
          // Load CSS
          if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
            const link = document.createElement('link');
            link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
          }
          
          // Load JS
          if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
              script.async = true;
              
              script.onload = () => resolve();
              script.onerror = () => reject(new Error("Failed to load Mapbox GL JS"));
              
              document.head.appendChild(script);
            });
          }

          // Wait for mapboxgl to be available
          let attempts = 0;
          while (!(window as any).mapboxgl && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }

          if (!(window as any).mapboxgl) {
            throw new Error("Mapbox GL JS failed to load");
          }
        }

        if (cancelled) return;

        console.log("[Mapbox] Creating map instance...");
        
        // Set access token
        (window as any).mapboxgl.accessToken = accessToken;
        
        // Create map
        mapInstance = new (window as any).mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center,
          zoom,
          attributionControl: false,
          logoPosition: 'bottom-right'
        });

        // Add navigation controls
        mapInstance.addControl(
          new (window as any).mapboxgl.NavigationControl({
            showCompass: false,
            showZoom: true
          }),
          'bottom-right'
        );

        // Handle load event
        mapInstance.on('load', () => {
          console.log("[Mapbox] Map loaded successfully!");
          if (!cancelled) {
            setMap(mapInstance);
            setIsLoading(false);
            setError(null);
            if (onMapReady) onMapReady(mapInstance);
          }
        });

        // Handle errors
        mapInstance.on('error', (e: any) => {
          console.error("[Mapbox] Map error:", e);
          if (!cancelled) {
            setError("Failed to load map");
            setIsLoading(false);
          }
        });

      } catch (error: any) {
        console.error("[Mapbox] Initialization error:", error);
        if (!cancelled) {
          setError(error.message || "Failed to initialize map");
          setIsLoading(false);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeMap, 100);
    
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (e) {
          console.error("[Mapbox] Cleanup error:", e);
        }
      }
    };
  }, [containerRef, accessToken, center, zoom]);

  return { map, isLoading, error };
}
