
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

        // Wait for container to be mounted and have dimensions
        let attempts = 0;
        const maxAttempts = 100; // Increased attempts
        
        while (attempts < maxAttempts) {
          const container = containerRef.current;
          
          if (container) {
            // Force a layout check
            const rect = container.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(container);
            
            console.log("[SimpleMapbox] Container check:", {
              exists: !!container,
              offsetWidth: container.offsetWidth,
              offsetHeight: container.offsetHeight,
              rectWidth: rect.width,
              rectHeight: rect.height,
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              attempt: attempts + 1
            });
            
            if (rect.width > 0 && rect.height > 0 && computedStyle.display !== 'none') {
              console.log("[SimpleMapbox] Container ready!");
              break;
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 50));
          attempts++;
        }

        const finalContainer = containerRef.current;
        if (!finalContainer) {
          throw new Error(`Container not found after ${maxAttempts} attempts`);
        }

        const finalRect = finalContainer.getBoundingClientRect();
        if (finalRect.width === 0 || finalRect.height === 0) {
          throw new Error(`Container has no dimensions: ${finalRect.width}x${finalRect.height}`);
        }

        // Wait for Mapbox to be available
        if (!(window as any).mapboxgl) {
          throw new Error("Mapbox GL JS not loaded");
        }

        console.log("[SimpleMapbox] Creating map...");
        initializationRef.current = true;

        // Set access token
        (window as any).mapboxgl.accessToken = accessToken;
        
        // Create map with light style (grey appearance)
        const mapInstance = new (window as any).mapboxgl.Map({
          container: finalContainer,
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
        initializationRef.current = false; // Allow retry
      }
    };

    // Start initialization with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeMap, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [accessToken, center, zoom]);

  return { map, isLoading, error };
}
