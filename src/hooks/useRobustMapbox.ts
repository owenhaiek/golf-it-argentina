
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
    let retryCount = 0;
    const maxRetries = 10;

    const waitForContainer = async (): Promise<boolean> => {
      return new Promise((resolve) => {
        const checkContainer = () => {
          if (containerRef.current) {
            console.log("[RobustMap] Container found:", containerRef.current);
            resolve(true);
            return;
          }
          
          retryCount++;
          if (retryCount >= maxRetries) {
            console.log("[RobustMap] Container not found after", maxRetries, "attempts");
            resolve(false);
            return;
          }
          
          console.log("[RobustMap] Waiting for container, attempt", retryCount);
          setTimeout(checkContainer, 200);
        };
        
        checkContainer();
      });
    };

    const initializeMap = async () => {
      try {
        console.log("[RobustMap] Starting initialization...");
        setIsLoading(true);
        setError(null);
        
        // Validate token first
        if (!accessToken) {
          throw new Error("Mapbox access token is required");
        }
        
        if (accessToken.length < 10 || !accessToken.startsWith('pk.')) {
          throw new Error("Invalid Mapbox access token format");
        }

        console.log("[RobustMap] Token validated");

        // Wait for container to be available
        const containerAvailable = await waitForContainer();
        if (!containerAvailable || cancelled) {
          throw new Error("Map container is not available");
        }

        console.log("[RobustMap] Container validated, loading resources...");

        // Check if Mapbox is already loaded
        if (!(window as any).mapboxgl) {
          console.log("[RobustMap] Loading Mapbox resources...");
          
          // Load CSS first
          if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
            await new Promise<void>((resolve, reject) => {
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
          }
          
          // Load JavaScript
          if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
            await new Promise<void>((resolve, reject) => {
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
          }

          // Wait for mapboxgl to be available
          let attempts = 0;
          while (!(window as any).mapboxgl && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }

          if (!(window as any).mapboxgl) {
            throw new Error("Mapbox GL failed to initialize after loading");
          }
        }

        if (cancelled) return;

        console.log("[RobustMap] Creating map instance...");
        
        // Double-check container is still available
        if (!containerRef.current) {
          throw new Error("Container became unavailable during initialization");
        }
        
        // Set access token
        (window as any).mapboxgl.accessToken = accessToken;
        
        // Create map with error handling
        try {
          mapInstance = new (window as any).mapboxgl.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center,
            zoom,
            attributionControl: false,
            logoPosition: 'bottom-right'
          });
        } catch (tokenError: any) {
          console.error("[RobustMap] Map creation error:", tokenError);
          if (tokenError.message.includes('token') || tokenError.message.includes('Unauthorized')) {
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

    // Initialize with a delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        initializeMap();
      }
    }, 500);
    
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
  }, [containerRef, accessToken, center, zoom]);

  return { map, isLoading, error };
}
