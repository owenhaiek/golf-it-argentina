
import { useEffect, useState, MutableRefObject } from "react";

interface UseMapboxOptions {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  onMapLoaded?: (mapInstance: any) => void;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
}

// Helper to load Mapbox script/CSS
function loadMapboxResources(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.mapboxgl) return resolve();

    // Load CSS
    if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Load JS
    if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = true;

      script.onload = () => {
        // Give the browser a tick to attach window.mapboxgl
        setTimeout(() => {
          if (window.mapboxgl) resolve();
          else reject(new Error("MapboxGL did not register on window"));
        }, 50);
      };

      script.onerror = () => reject(new Error("Failed to load MapboxGL JS"));
      document.head.appendChild(script);
    } else {
      // If already loading somewhere else, poll until available
      let pollAttempts = 0;
      const pollInterval = setInterval(() => {
        if (window.mapboxgl) {
          clearInterval(pollInterval);
          resolve();
        } else if (++pollAttempts > 40) { // Wait max 4s
          clearInterval(pollInterval);
          reject(new Error("MapboxGL failed to load in time"));
        }
      }, 100);
    }
  });
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

  // Load Mapbox scripts/styles and set state
  useEffect(() => {
    let cancelled = false;
    setInitError(null);
    setScriptsLoaded(false);
    loadMapboxResources()
      .then(() => {
        if (!cancelled) setScriptsLoaded(true);
      })
      .catch((err) => {
        console.error("Error loading Mapbox resources:", err);
        setInitError("Failed to load map resources");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize the map
  useEffect(() => {
    if (!scriptsLoaded || !containerRef.current || map || initError) return;
    // Defensive: Check token/center/zoom
    if (!accessToken || !Array.isArray(center) || !containerRef.current) return;

    let mapInstance: any = null;
    setMapLoaded(false);
    try {
      window.mapboxgl.accessToken = accessToken;
      mapInstance = new window.mapboxgl.Map({
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
        new window.mapboxgl.NavigationControl({ showCompass: false, showZoom: true }),
        'bottom-right'
      );

      const onLoad = () => {
        if (mapInstance) {
          setMapLoaded(true);
          onMapLoaded?.(mapInstance);
        }
      };
      const onError = (e: any) => {
        // Often error.userData.error.message
        let errorMessage = "Map failed to load";
        if (e?.error?.message) errorMessage += ": " + e.error.message;
        setInitError(errorMessage);
        setMapLoaded(false);
        try { mapInstance?.remove(); } catch { }
      };

      mapInstance.on('load', onLoad);
      mapInstance.on('error', onError);

      setMap(mapInstance);

    } catch (error: any) {
      console.error("Error initializing map:", error);
      setInitError("Failed to initialize map: " + (error?.message || error));
      setMapLoaded(false);
    }

    // Clean up map instance
    return () => {
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (e) {
          // Already removed, ignore
        }
      }
      setMap(null);
      setMapLoaded(false);
    };
    // eslint-disable-next-line
  }, [scriptsLoaded, containerRef, accessToken, JSON.stringify(center), zoom /* do NOT put onMapLoaded here */]);

  return { map, mapLoaded, scriptsLoaded, initError };
}
