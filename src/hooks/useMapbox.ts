
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

        // Wait for Mapbox to be available
        console.log("[Mapbox] Checking for Mapbox GL JS...");
        if (!(window as any).mapboxgl) {
          throw new Error("Mapbox GL JS not loaded. Please check your internet connection.");
        }

        // Wait for container with improved logic
        console.log("[Mapbox] Waiting for container...");
        await waitForContainer();

        if (cancelled) return;

        console.log("[Mapbox] Container is ready, creating map...");
        
        // Set access token
        (window as any).mapboxgl.accessToken = accessToken;
        
        // Create map
        mapInstance = new (window as any).mapboxgl.Map({
          container: containerRef.current!,
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
            setError(`Map error: ${e.error?.message || 'Unknown error'}`);
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

    const waitForContainer = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // Increased attempts
        
        const checkContainer = () => {
          if (cancelled) {
            reject(new Error("Operation cancelled"));
            return;
          }

          const container = containerRef.current;
          const containerExists = !!container;
          const containerMounted = container && container.parentElement;
          const containerVisible = container && container.offsetWidth > 0 && container.offsetHeight > 0;
          
          console.log(`[Mapbox] Container check #${attempts + 1}:`, {
            exists: containerExists,
            mounted: !!containerMounted,
            visible: containerVisible,
            width: container?.offsetWidth || 0,
            height: container?.offsetHeight || 0,
            hasParent: !!container?.parentElement,
            isConnected: container?.isConnected || false
          });

          // Container is ready if it exists, is mounted, and has dimensions
          if (containerExists && containerMounted && containerVisible) {
            console.log("[Mapbox] Container is ready!");
            resolve();
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error(`Container not ready after ${maxAttempts} attempts. Container exists: ${containerExists}, Mounted: ${!!containerMounted}, Width: ${container?.offsetWidth || 0}, Height: ${container?.offsetHeight || 0}`));
            return;
          }

          // Use longer intervals for later attempts
          const delay = attempts < 20 ? 50 : attempts < 50 ? 100 : 200;
          setTimeout(checkContainer, delay);
        };

        // Start checking after a small delay to allow React to render
        setTimeout(checkContainer, 100);
      });
    };

    // Start initialization
    initializeMap();
    
    return () => {
      cancelled = true;
      if (mapInstance) {
        try {
          console.log("[Mapbox] Cleaning up map instance");
          mapInstance.remove();
        } catch (e) {
          console.error("[Mapbox] Cleanup error:", e);
        }
      }
    };
  }, [accessToken, center, zoom]); // Removed containerRef from dependencies

  return { map, isLoading, error };
}
