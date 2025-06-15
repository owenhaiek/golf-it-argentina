
import { useEffect, useState, MutableRefObject } from "react";

interface UseMapboxOptions {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  onMapLoaded?: (mapInstance: any) => void;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
}

export function useMapbox({ containerRef, onMapLoaded, center = [-58.3816, -34.6118], zoom = 6, accessToken }: UseMapboxOptions) {
  const [map, setMap] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Only inject Mapbox GL script + stylesheet once, persistent across hooks (browser session)
  useEffect(() => {
    // Bail if already loaded
    if (window.mapboxgl) {
      setScriptsLoaded(true);
      return;
    }

    // Check if loading is already in progress
    if (!document.getElementById('mapbox-gl-script')) {
      // Add stylesheet if not present
      if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        link.id = 'mapbox-gl-css';
        document.head.appendChild(link);
      }
      // Add JS script
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = true;
      script.id = 'mapbox-gl-script';
      script.onload = () => {
        setScriptsLoaded(true);
        // Double-check window.mapboxgl actually loaded
        if (!window.mapboxgl) setInitError("Mapbox script failed to expose window.mapboxgl");
      };
      script.onerror = () => {
        setInitError("Failed to load Mapbox GL script.");
      };
      document.head.appendChild(script);
    } else {
      // Wait for script tag to finish - poll window.mapboxgl
      const poll = setInterval(() => {
        if (window.mapboxgl) {
          setScriptsLoaded(true);
          clearInterval(poll);
        }
      }, 100);
      setTimeout(() => clearInterval(poll), 10000);
    }
  }, []);

  // Actual map instance creation when all ready
  useEffect(() => {
    // Clean up and delay until ready
    let destroyed = false;
    if (!scriptsLoaded || !containerRef.current) return;

    if (!window.mapboxgl) {
      setInitError("Mapbox script failed to set window.mapboxgl");
      return;
    }

    if (map) {
      // Already initialized; don't do again.
      return;
    }

    try {
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
        if (destroyed) return; // Clean up attempt
        setMapLoaded(true);
        onMapLoaded?.(mapInstance);
      });

      mapInstance.on('error', () => {
        setInitError("Map failed to load properly");
      });

      setMap(mapInstance);
    } catch (err) {
      setInitError("Failed to initialize map: " + ((err as Error).message ?? String(err)));
    }

    return () => {
      destroyed = true;
      if (map) {
        map.remove();
        setMap(null);
        setMapLoaded(false);
      }
    };
    // eslint-disable-next-line
  }, [scriptsLoaded, containerRef]);

  return { map, mapLoaded, scriptsLoaded, initError };
}
