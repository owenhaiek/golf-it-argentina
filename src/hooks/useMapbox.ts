
import { useEffect, useState, MutableRefObject } from "react";

interface UseMapboxOptions {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  onMapLoaded?: (mapInstance: any) => void;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
}

export function useMapbox({
  containerRef,
  onMapLoaded,
  center = [-58.3816, -34.6118],
  zoom = 6,
  accessToken,
}: UseMapboxOptions) {
  const [map, setMap] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Load Mapbox scripts and styles
  useEffect(() => {
    if (window.mapboxgl) {
      setScriptsLoaded(true);
      return;
    }

    const loadMapboxResources = async () => {
      try {
        // Load CSS first
        if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
          const link = document.createElement('link');
          link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }

        // Load JavaScript
        if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
          script.async = true;
          
          const scriptPromise = new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
          
          document.head.appendChild(script);
          await scriptPromise;
        }

        // Wait for window.mapboxgl to be available
        let attempts = 0;
        while (!window.mapboxgl && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (window.mapboxgl) {
          setScriptsLoaded(true);
        } else {
          throw new Error("Mapbox GL failed to load");
        }
      } catch (error) {
        console.error("Error loading Mapbox resources:", error);
        setInitError("Failed to load map resources");
      }
    };

    loadMapboxResources();
  }, []);

  // Initialize map when scripts are loaded
  useEffect(() => {
    if (!scriptsLoaded || !containerRef.current || map || initError) return;

    try {
      console.log("Initializing Mapbox map...");
      
      window.mapboxgl.accessToken = accessToken;
      
      const mapInstance = new window.mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center,
        zoom,
        pitch: 0,
        bearing: 0,
        antialias: true,
        attributionControl: false,
        preserveDrawingBuffer: true,
      });

      mapInstance.addControl(
        new window.mapboxgl.NavigationControl({
          showCompass: false,
          showZoom: true,
        }),
        'bottom-right'
      );

      mapInstance.on('load', () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        onMapLoaded?.(mapInstance);
      });

      mapInstance.on('error', (e) => {
        console.error("Map error:", e);
        setInitError("Map failed to load");
      });

      setMap(mapInstance);
    } catch (error) {
      console.error("Error initializing map:", error);
      setInitError(`Failed to initialize map: ${error}`);
    }

    return () => {
      if (map) {
        map.remove();
        setMap(null);
        setMapLoaded(false);
      }
    };
  }, [scriptsLoaded, containerRef, accessToken, center, zoom, onMapLoaded]);

  return { map, mapLoaded, scriptsLoaded, initError };
}
