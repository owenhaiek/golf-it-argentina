
import { useEffect, useState, useRef, MutableRefObject } from "react";

interface UseSimpleMapboxOptions {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
  onMapReady?: (map: any) => void;
}

export function useSimpleMapbox({
  containerRef,
  center = [-58.3816, -34.6118],
  zoom = 6,
  accessToken,
  onMapReady
}: UseSimpleMapboxOptions) {
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) return;
    
    const initializeMap = async () => {
      try {
        console.log("[SimpleMapbox] Starting initialization...");
        
        if (!accessToken) {
          throw new Error("Mapbox access token is required");
        }

        // Wait for container to be ready
        let attempts = 0;
        while (attempts < 30) {
          const container = containerRef.current;
          if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
            console.log("[SimpleMapbox] Container ready:", {
              width: container.offsetWidth,
              height: container.offsetHeight
            });
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!containerRef.current || containerRef.current.offsetWidth === 0) {
          throw new Error("Container not ready");
        }

        // Wait for Mapbox to be available
        if (!(window as any).mapboxgl) {
          throw new Error("Mapbox GL JS not loaded");
        }

        console.log("[SimpleMapbox] Creating map...");
        initializationRef.current = true;

        // Set access token
        (window as any).mapboxgl.accessToken = accessToken;
        
        // Create map with grey style
        const mapInstance = new (window as any).mapboxgl.Map({
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
          console.log("[SimpleMapbox] Map loaded successfully!");
          setMap(mapInstance);
          setIsLoading(false);
          setError(null);
          if (onMapReady) onMapReady(mapInstance);
        });

        // Handle errors
        mapInstance.on('error', (e: any) => {
          console.error("[SimpleMapbox] Map error:", e);
          setError("Failed to load map");
          setIsLoading(false);
        });

      } catch (error: any) {
        console.error("[SimpleMapbox] Initialization error:", error);
        setError(error.message || "Failed to initialize map");
        setIsLoading(false);
      }
    };

    // Start initialization after a small delay
    const timeoutId = setTimeout(initializeMap, 200);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [accessToken]);

  return { map, isLoading, error };
}
