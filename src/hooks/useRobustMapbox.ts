
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

    const waitForContainer = async (): Promise<boolean> => {
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 10 seconds max
        
        const checkContainer = () => {
          if (cancelled) {
            resolve(false);
            return;
          }
          
          const container = containerRef.current;
          
          // Check if container exists and is properly mounted in DOM
          if (container && 
              container.offsetParent !== null && 
              container.clientWidth > 0 && 
              container.clientHeight > 0) {
            console.log("[RobustMap] Container ready:", {
              width: container.clientWidth,
              height: container.clientHeight,
              inDOM: document.contains(container)
            });
            resolve(true);
            return;
          }
          
          attempts++;
          if (attempts >= maxAttempts) {
            console.log("[RobustMap] Container timeout after", attempts, "attempts");
            resolve(false);
            return;
          }
          
          console.log("[RobustMap] Waiting for container, attempt", attempts);
          setTimeout(checkContainer, 200);
        };
        
        // Start checking after a small delay to allow React to render
        setTimeout(checkContainer, 100);
      });
    };

    const initializeMap = async () => {
      try {
        console.log("[RobustMap] Starting initialization...");
        setIsLoading(true);
        setError(null);
        
        // Validate token first
        if (!accessToken || accessToken.length < 10 || !accessToken.startsWith('pk.')) {
          throw new Error("Invalid Mapbox access token");
        }

        // Wait for container to be properly available
        const containerAvailable = await waitForContainer();
        if (!containerAvailable || cancelled) {
          throw new Error("Map container is not available or not properly mounted");
        }

        // Double-check container one more time before proceeding
        if (!containerRef.current) {
          throw new Error("Container reference lost during initialization");
        }

        console.log("[RobustMap] Container validated, loading Mapbox...");

        // Load Mapbox resources if not already loaded
        if (!(window as any).mapboxgl) {
          // Load CSS
          if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
            await new Promise<void>((resolve, reject) => {
              const link = document.createElement('link');
              link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
              link.rel = 'stylesheet';
              
              const timeout = setTimeout(() => reject(new Error("CSS timeout")), 10000);
              
              link.onload = () => {
                clearTimeout(timeout);
                resolve();
              };
              link.onerror = () => {
                clearTimeout(timeout);
                reject(new Error("Failed to load CSS"));
              };
              
              document.head.appendChild(link);
            });
          }
          
          // Load JavaScript
          if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
              
              const timeout = setTimeout(() => reject(new Error("Script timeout")), 15000);
              
              script.onload = () => {
                clearTimeout(timeout);
                resolve();
              };
              script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error("Failed to load script"));
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
            throw new Error("Mapbox GL failed to load");
          }
        }

        if (cancelled) return;

        // Final container check
        if (!containerRef.current) {
          throw new Error("Container became unavailable");
        }
        
        console.log("[RobustMap] Creating map...");
        
        (window as any).mapboxgl.accessToken = accessToken;
        
        mapInstance = new (window as any).mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center,
          zoom,
          attributionControl: false,
          logoPosition: 'bottom-right'
        });

        // Add controls
        mapInstance.addControl(
          new (window as any).mapboxgl.NavigationControl({ 
            showCompass: false,
            showZoom: true 
          }),
          'bottom-right'
        );

        // Handle events
        mapInstance.on('load', () => {
          console.log("[RobustMap] Map loaded successfully!");
          if (!cancelled) {
            setMap(mapInstance);
            setIsLoading(false);
            setError(null);
            if (onMapReady) onMapReady(mapInstance);
          }
        });

        mapInstance.on('error', (e: any) => {
          console.error("[RobustMap] Map error:", e);
          if (!cancelled) {
            setError(e.error?.message || "Map failed to load");
            setIsLoading(false);
          }
        });

      } catch (error: any) {
        console.error("[RobustMap] Initialization error:", error);
        if (!cancelled) {
          setError(error.message || "Failed to initialize map");
          setIsLoading(false);
        }
      }
    };

    // Start initialization with proper timing
    const initTimeout = setTimeout(() => {
      if (!cancelled) {
        initializeMap();
      }
    }, 300);
    
    return () => {
      cancelled = true;
      clearTimeout(initTimeout);
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
