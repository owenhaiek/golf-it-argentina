
import { useEffect, useState, MutableRefObject } from "react";

interface UseRobustMapboxOptions {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
  onMapReady?: (map: any) => void;
}

export function useRobustMapbox({
  containerRef,
  center = [-58.3816, -34.6118],
  zoom = 6,
  accessToken,
  onMapReady
}: UseRobustMapboxOptions) {
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let mapInstance: any = null;

    const initializeMap = async () => {
      try {
        console.log("[RobustMap] Starting initialization...");
        
        // Validate token first
        if (!accessToken) {
          throw new Error("Mapbox access token is required");
        }
        
        if (accessToken.length < 10) {
          throw new Error("Invalid Mapbox access token format");
        }
        
        if (!accessToken.startsWith('pk.')) {
          throw new Error("Mapbox token should start with 'pk.'");
        }

        // Validate container
        if (!containerRef.current) {
          throw new Error("Map container is not available");
        }

        console.log("[RobustMap] Token and container validated");

        // Check if Mapbox is already loaded
        if (!(window as any).mapboxgl) {
          console.log("[RobustMap] Loading Mapbox resources...");
          
          // Load CSS first
          await new Promise<void>((resolve, reject) => {
            if (document.querySelector('link[href*="mapbox-gl.css"]')) {
              resolve();
              return;
            }
            
            const link = document.createElement('link');
            link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
            link.rel = 'stylesheet';
            
            const timeout = setTimeout(() => {
              reject(new Error("CSS loading timeout"));
            }, 10000);
            
            link.onload = () => {
              clearTimeout(timeout);
              console.log("[RobustMap] CSS loaded");
              resolve();
            };
            
            link.onerror = () => {
              clearTimeout(timeout);
              reject(new Error("Failed to load Mapbox CSS"));
            };
            
            document.head.appendChild(link);
          });
          
          // Load JavaScript
          await new Promise<void>((resolve, reject) => {
            if (document.querySelector('script[src*="mapbox-gl.js"]')) {
              resolve();
              return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
            script.async = true;
            
            const timeout = setTimeout(() => {
              reject(new Error("Script loading timeout"));
            }, 15000);
            
            script.onload = () => {
              clearTimeout(timeout);
              console.log("[RobustMap] Script loaded");
              resolve();
            };
            
            script.onerror = () => {
              clearTimeout(timeout);
              reject(new Error("Failed to load Mapbox script"));
            };
            
            document.head.appendChild(script);
          });

          // Wait for mapboxgl to be available
          let attempts = 0;
          while (!(window as any).mapboxgl && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }

          if (!(window as any).mapboxgl) {
            throw new Error("Mapbox GL failed to initialize after loading");
          }
        }

        if (cancelled) return;

        console.log("[RobustMap] Creating map instance...");
        
        // Set access token
        (window as any).mapboxgl.accessToken = accessToken;
        
        // Test token by creating a temporary map instance
        try {
          const testMap = new (window as any).mapboxgl.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center,
            zoom,
            attributionControl: false,
            logoPosition: 'bottom-right'
          });
          
          mapInstance = testMap;
        } catch (tokenError: any) {
          if (tokenError.message.includes('token')) {
            throw new Error("Invalid Mapbox token - please check your token");
          }
          throw tokenError;
        }

        // Add controls
        mapInstance.addControl(
          new (window as any).mapboxgl.NavigationControl({ 
            showCompass: false,
            showZoom: true 
          }),
          'bottom-right'
        );

        // Handle load event
        mapInstance.on('load', () => {
          console.log("[RobustMap] Map ready!");
          if (!cancelled) {
            setMap(mapInstance);
            setIsLoading(false);
            setError(null);
            if (onMapReady) onMapReady(mapInstance);
          }
        });

        // Handle errors
        mapInstance.on('error', (e: any) => {
          console.error("[RobustMap] Map error:", e);
          if (!cancelled) {
            const errorMsg = e.error?.message || "Map failed to load";
            setError(errorMsg);
            setIsLoading(false);
          }
        });

      } catch (error: any) {
        console.error("[RobustMap] Init error:", error);
        if (!cancelled) {
          setError(error.message || "Failed to initialize map");
          setIsLoading(false);
        }
      }
    };

    if (containerRef.current && accessToken) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(initializeMap, 100);
      
      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
        if (mapInstance) {
          try {
            mapInstance.remove();
          } catch (e) {
            console.error("[RobustMap] Cleanup error:", e);
          }
        }
      };
    } else {
      const missingParts = [];
      if (!containerRef.current) missingParts.push("container");
      if (!accessToken) missingParts.push("token");
      
      setError(`Missing required: ${missingParts.join(", ")}`);
      setIsLoading(false);
    }
  }, [containerRef, accessToken, center, zoom]);

  return { map, isLoading, error };
}
