
import { useEffect, useState, MutableRefObject } from "react";

interface UseReliableMapboxOptions {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
}

export function useReliableMapbox({
  containerRef,
  center = [-58.3816, -34.6118],
  zoom = 6,
  accessToken,
}: UseReliableMapboxOptions) {
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let cancelled = false;
    let mapInstance: any = null;

    const initializeMap = async () => {
      try {
        console.log("[Map] Starting initialization...");
        setIsLoading(true);
        setError(null);

        // Validate token
        if (!accessToken || accessToken.length < 10) {
          throw new Error("Invalid Mapbox access token");
        }

        // Set timeout for the entire operation
        timeoutId = setTimeout(() => {
          if (!cancelled) {
            setError("Map initialization timed out");
            setIsLoading(false);
          }
        }, 15000);

        // Check if scripts are already loaded
        if (!(window as any).mapboxgl) {
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
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
              script.async = true;
              
              const loadTimeout = setTimeout(() => {
                reject(new Error("Script loading timeout"));
              }, 10000);
              
              script.onload = () => {
                clearTimeout(loadTimeout);
                console.log("[Map] Script loaded successfully");
                resolve();
              };
              
              script.onerror = () => {
                clearTimeout(loadTimeout);
                reject(new Error("Failed to load Mapbox script"));
              };
              
              document.head.appendChild(script);
            });
          }

          // Wait for mapboxgl to be available with timeout
          let attempts = 0;
          while (!(window as any).mapboxgl && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }

          if (!(window as any).mapboxgl) {
            throw new Error("Mapbox GL failed to initialize after loading");
          }
        }

        // Check if container is available
        if (!containerRef.current) {
          throw new Error("Map container not available");
        }

        console.log("[Map] Creating map instance...");
        
        // Set access token
        (window as any).mapboxgl.accessToken = accessToken;
        
        // Create map
        mapInstance = new (window as any).mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center,
          zoom,
          attributionControl: false,
        });

        // Add navigation controls
        mapInstance.addControl(
          new (window as any).mapboxgl.NavigationControl({ showCompass: false }),
          'bottom-right'
        );

        // Set up event handlers
        mapInstance.on('load', () => {
          console.log("[Map] Map loaded successfully");
          if (!cancelled) {
            clearTimeout(timeoutId);
            setMap(mapInstance);
            setIsLoading(false);
            setError(null);
          }
        });

        mapInstance.on('error', (e: any) => {
          console.error("[Map] Map error:", e);
          if (!cancelled) {
            clearTimeout(timeoutId);
            setError(`Map error: ${e.error?.message || 'Unknown error'}`);
            setIsLoading(false);
          }
        });

      } catch (error: any) {
        console.error("[Map] Initialization error:", error);
        if (!cancelled) {
          clearTimeout(timeoutId);
          setError(error.message || "Failed to initialize map");
          setIsLoading(false);
        }
      }
    };

    // Only initialize if we have a container and token
    if (containerRef.current && accessToken) {
      initializeMap();
    } else {
      setError("Missing container or access token");
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (e) {
          console.error("[Map] Error removing map:", e);
        }
      }
      setMap(null);
    };
  }, [containerRef, accessToken, center, zoom]);

  return { map, isLoading, error };
}
