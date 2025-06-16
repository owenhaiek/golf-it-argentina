
import { useEffect, useState, MutableRefObject } from "react";

interface UseOptimizedMapboxOptions {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
  onMapReady?: (map: any) => void;
}

export function useOptimizedMapbox({
  containerRef,
  center = [-58.3816, -34.6118],
  zoom = 6,
  accessToken,
  onMapReady
}: UseOptimizedMapboxOptions) {
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let mapInstance: any = null;

    const initializeMap = async () => {
      try {
        console.log("[OptimizedMap] Starting fast initialization...");
        
        if (!accessToken || !containerRef.current) {
          throw new Error("Missing requirements");
        }

        // Check if Mapbox is already loaded
        if (!(window as any).mapboxgl) {
          console.log("[OptimizedMap] Loading Mapbox resources...");
          
          // Load resources in parallel
          const [cssLoaded, scriptLoaded] = await Promise.all([
            // Load CSS
            new Promise<void>((resolve) => {
              if (document.querySelector('link[href*="mapbox-gl.css"]')) {
                resolve();
                return;
              }
              const link = document.createElement('link');
              link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
              link.rel = 'stylesheet';
              link.onload = () => resolve();
              document.head.appendChild(link);
            }),
            
            // Load JS
            new Promise<void>((resolve, reject) => {
              if (document.querySelector('script[src*="mapbox-gl.js"]')) {
                resolve();
                return;
              }
              const script = document.createElement('script');
              script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
              script.async = true;
              
              const timeout = setTimeout(() => reject(new Error("Script timeout")), 8000);
              
              script.onload = () => {
                clearTimeout(timeout);
                resolve();
              };
              script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error("Script failed"));
              };
              
              document.head.appendChild(script);
            })
          ]);

          // Wait for mapboxgl to be available (with shorter timeout)
          let attempts = 0;
          while (!(window as any).mapboxgl && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
          }

          if (!(window as any).mapboxgl) {
            throw new Error("Mapbox failed to load");
          }
        }

        if (cancelled) return;

        console.log("[OptimizedMap] Creating map...");
        
        // Set access token
        (window as any).mapboxgl.accessToken = accessToken;
        
        // Create map with optimized settings
        mapInstance = new (window as any).mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center,
          zoom,
          attributionControl: false,
          logoPosition: 'bottom-right',
          renderWorldCopies: false,
          maxTileCacheSize: 50
        });

        // Add controls
        mapInstance.addControl(
          new (window as any).mapboxgl.NavigationControl({ 
            showCompass: false,
            showZoom: true,
            visualizePitch: false 
          }),
          'bottom-right'
        );

        // Handle load event
        mapInstance.on('load', () => {
          console.log("[OptimizedMap] Map ready!");
          if (!cancelled) {
            setMap(mapInstance);
            setIsLoading(false);
            setError(null);
            if (onMapReady) onMapReady(mapInstance);
          }
        });

        // Handle errors
        mapInstance.on('error', (e: any) => {
          console.error("[OptimizedMap] Error:", e);
          if (!cancelled) {
            setError("Map failed to load");
            setIsLoading(false);
          }
        });

      } catch (error: any) {
        console.error("[OptimizedMap] Init error:", error);
        if (!cancelled) {
          setError(error.message || "Failed to initialize map");
          setIsLoading(false);
        }
      }
    };

    if (containerRef.current && accessToken) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(initializeMap, 50);
      
      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
        if (mapInstance) {
          try {
            mapInstance.remove();
          } catch (e) {
            console.error("[OptimizedMap] Cleanup error:", e);
          }
        }
      };
    } else {
      setError("Missing container or token");
      setIsLoading(false);
    }
  }, [containerRef, accessToken, center, zoom]);

  return { map, isLoading, error };
}
