
import { useEffect, useState, MutableRefObject } from "react";

interface UseMapboxOptions {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  onMapLoaded?: (mapInstance: any) => void;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
}

// Improved state guards and race-free scripts loading
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

  // Prevent race on script/style load
  useEffect(() => {
    let scriptReady = !!window.mapboxgl;
    if (scriptReady) {
      setScriptsLoaded(true);
      return;
    }

    // Load CSS first if not present
    if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      link.id = 'mapbox-gl-css';
      document.head.appendChild(link);
    }

    // Load JS if not present, else poll
    const finalCheckReady = () => {
      if (window.mapboxgl) {
        setScriptsLoaded(true);
        scriptReady = true;
      }
    };

    if (!document.getElementById('mapbox-gl-script')) {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = true;
      script.id = 'mapbox-gl-script';
      script.onload = finalCheckReady;
      script.onerror = () => setInitError("Failed to load Mapbox GL script.");
      document.head.appendChild(script);
    } else {
      // Poll for window.mapboxgl for up to 5s, then error out
      let pollTimeout: number | undefined;
      const poll = setInterval(() => {
        finalCheckReady();
        if (scriptReady) clearInterval(poll);
      }, 100);
      pollTimeout = setTimeout(() => {
        clearInterval(poll)
        if (!window.mapboxgl) setInitError("Mapbox script failed to load.");
      }, 5000) as unknown as number;
      return () => {
        clearInterval(poll);
        if (pollTimeout) clearTimeout(pollTimeout);
      };
    }
  }, []);

  // Clean map initialization, avoid double/multiple inits
  useEffect(() => {
    let destroyed = false;
    if (!scriptsLoaded || !containerRef.current || map) return;

    if (!window.mapboxgl) {
      setInitError("Mapbox script failed to set window.mapboxgl");
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
        if (destroyed) return;
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

  // Effect: If script error, abort loading state
  useEffect(() => {
    if (initError && !mapLoaded) setMapLoaded(false);
  }, [initError, mapLoaded]);

  return { map, mapLoaded, scriptsLoaded, initError };
}
