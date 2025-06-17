
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
    if (initializationRef.current || !accessToken) return;
    
    const initializeMap = async () => {
      try {
        console.log("[SimpleMapbox] Starting initialization...");
        
        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check container availability
        let attempts = 0;
        const maxAttempts = 50;
        let container: HTMLDivElement | null = null;
        
        while (attempts < maxAttempts) {
          container = containerRef.current;
          
          if (container) {
            container.style.display = container.style.display || 'block';
            const rect = container.getBoundingClientRect();
            
            if (container.isConnected && rect.width > 0 && rect.height > 0) {
              console.log("[SimpleMapbox] Container ready!");
              break;
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!container || !container.isConnected) {
          throw new Error(`Container not available after ${maxAttempts} attempts`);
        }

        // Ensure Mapbox GL is loaded
        if (!(window as any).mapboxgl) {
          console.log("[SimpleMapbox] Loading Mapbox GL...");
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        console.log("[SimpleMapbox] Creating map instance...");
        initializationRef.current = true;

        // Set access token
        (window as any).mapboxgl.accessToken = accessToken;
        
        // Create map with improved settings for stability
        const mapInstance = new (window as any).mapboxgl.Map({
          container: container,
          style: 'mapbox://styles/mapbox/light-v11',
          center,
          zoom,
          attributionControl: false,
          logoPosition: 'bottom-right',
          // Improved zoom and interaction settings
          minZoom: 2,
          maxZoom: 18,
          maxBounds: [
            [-180, -85], // Southwest coordinates
            [180, 85]    // Northeast coordinates
          ],
          // Better performance settings
          antialias: false,
          optimizeForTerrain: false
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

        // Improved zoom handling - prevent conflicts
        let isUserZooming = false;
        
        mapInstance.on('zoomstart', (e: any) => {
          if (e.originalEvent) {
            isUserZooming = true;
          }
        });

        mapInstance.on('zoomend', () => {
          setTimeout(() => {
            isUserZooming = false;
          }, 100);
        });

        // Better wheel zoom handling
        mapInstance.on('wheel', (e: any) => {
          if (!isUserZooming) {
            e.preventDefault();
            const currentZoom = mapInstance.getZoom();
            const delta = e.originalEvent.deltaY > 0 ? -0.5 : 0.5;
            const newZoom = Math.max(2, Math.min(18, currentZoom + delta));
            
            mapInstance.easeTo({
              zoom: newZoom,
              duration: 200,
              easing: (t: number) => t
            });
          }
        });

      } catch (error: any) {
        console.error("[SimpleMapbox] Initialization error:", error);
        setError(error.message || "Failed to initialize map");
        setIsLoading(false);
        initializationRef.current = false;
      }
    };

    initializeMap();
    
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [accessToken, center, zoom]);

  return { map, isLoading, error };
}
