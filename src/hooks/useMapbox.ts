
import { useEffect, useState, useRef, MutableRefObject } from "react";

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

  useEffect(() => {
    if (window.mapboxgl) {
      setScriptsLoaded(true);
      return;
    }

    // Avoid loading script multiples times
    if (!document.querySelector('script[src*="mapbox-gl"]')) {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = false;
      script.onload = () => setScriptsLoaded(true);
      script.onerror = () => setInitError("Failed to load map resources");
      document.head.appendChild(script);
    } else {
      // If script loading, poll for window.mapboxgl
      const poll = setInterval(() => {
        if (window.mapboxgl) {
          setScriptsLoaded(true);
          clearInterval(poll);
        }
      }, 100);
      setTimeout(() => clearInterval(poll), 10000); // Safety
    }
  }, []);

  useEffect(() => {
    if (map || !scriptsLoaded || !containerRef.current) return;
    if (!window.mapboxgl) return;

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
        setMapLoaded(true);
        onMapLoaded?.(mapInstance);
      });
      mapInstance.on('error', (e: any) => setInitError("Map failed to load properly"));
      setMap(mapInstance);
    } catch {
      setInitError("Failed to initialize map");
    }

    return () => {
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
