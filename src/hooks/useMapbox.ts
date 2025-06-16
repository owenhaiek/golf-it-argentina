
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

    const waitForContainer = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds total
        
        const checkContainer = () => {
          if (cancelled) {
            reject(new Error("Operation cancelled"));
            return;
          }

          const container = containerRef.current;
          console.log(`[Mapbox] Container check attempt ${attempts + 1}:`, {
            exists: !!container,
            offsetWidth: container?.offsetWidth || 0,
            offsetHeight: container?.offsetHeight || 0,
            parentElement: !!container?.parentElement
          });

          if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
            console.log("[Mapbox] Container is ready");
            resolve();
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error(`Container not ready after ${maxAttempts} attempts. Container exists: ${!!container}, Width: ${container?.offsetWidth || 0}, Height: ${container?.offsetHeight || 0}`));
            return;
          }

          setTimeout(checkContainer, 100);
        };

        // Start checking immediately
        checkContainer();
      });
    };

    const waitForMapbox = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if ((window as any).mapboxgl) {
          console.log("[Mapbox] Mapbox GL JS already loaded");
          resolve();
          return;
        }

        let attempts = 0;
        const maxAttempts = 30; // 3 seconds
        
        const checkMapbox = () => {
          if (cancelled) {
            reject(new Error("Operation cancelled"));
            return;
          }

          if ((window as any).mapboxgl) {
            console.log("[Mapbox] Mapbox GL JS loaded");
            resolve();
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error("Mapbox GL JS failed to load"));
            return;
          }

          setTimeout(checkMapbox, 100);
        };

        checkMapbox();
      });
    };

    const initializeMap = async () => {
      try {
        console.log("[Mapbox] Starting initialization...");
        
        if (!accessToken) {
          throw new Error("Mapbox access token is required");
        }

        // Wait for both container and Mapbox to be ready
        await Promise.all([
          waitForContainer(),
          waitForMapbox()
        ]);

        if (cancelled) return;

        console.log("[Mapbox] Creating map instance...");
        
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

    // Start initialization with a small delay
    const timeoutId = setTimeout(initializeMap, 200);
    
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (mapInstance) {
        try {
          console.log("[Mapbox] Cleaning up map instance");
          mapInstance.remove();
        } catch (e) {
          console.error("[Mapbox] Cleanup error:", e);
        }
      }
    };
  }, [accessToken]); // Only depend on accessToken, not the refs

  return { map, isLoading, error };
}
