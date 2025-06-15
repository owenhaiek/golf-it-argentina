
import { useEffect, useState, MutableRefObject } from "react";

interface UseMapboxOptions {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  onMapLoaded?: (mapInstance: any) => void;
  center?: [number, number];
  zoom?: number;
  accessToken: string;
}

// Loads Mapbox JS/CSS once, resolves when ready or rejects on failure
function loadMapboxResources(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).mapboxgl) {
      resolve();
      return;
    }

    // Load CSS if not already loaded
    if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Load JS if not already loaded
    if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = true;
      script.onload = () => {
        setTimeout(() => {
          if ((window as any).mapboxgl) resolve();
          else reject(new Error("mapboxgl did not register on window"));
        }, 50);
      };
      script.onerror = () => reject(new Error("Failed to load mapbox-gl.js"));
      document.head.appendChild(script);
    } else {
      // Already queued/queued elsewhere, just poll until it's ready
      let pollAttempts = 0;
      const poll = setInterval(() => {
        if ((window as any).mapboxgl) {
          clearInterval(poll);
          resolve();
        }
        if (++pollAttempts > 50) { // 5s max
          clearInterval(poll);
          reject(new Error("Timed out waiting for mapboxgl to load"));
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

  // 1. Load script/styles (idempotent, with logging)
  useEffect(() => {
    let cancelled = false;
    setInitError(null);
    setScriptsLoaded(false);

    console.log("[Map] Loading Mapbox resources...");
    loadMapboxResources()
      .then(() => {
        if (!cancelled) {
          setScriptsLoaded(true);
          console.log("[Map] Mapbox script and CSS loaded.");
        }
      })
      .catch((err) => {
        console.error("[Map] Error loading resources:", err);
        setInitError("Failed to load map resources. Please try again.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Init map after scriptsLoaded only (with logging and safety)
  useEffect(() => {
    if (!scriptsLoaded) {
      return;
    }
    if (!containerRef.current) {
      console.warn("[Map] Map containerRef not ready.");
      return;
    }
    if (!accessToken) {
      setInitError("Missing map access token");
      return;
    }

    setMapLoaded(false);
    setInitError(null);

    let mapInstance: any = null;
    let didLoad = false;
    let loadTimeout: ReturnType<typeof setTimeout> | undefined;

    try {
      (window as any).mapboxgl.accessToken = accessToken;
      mapInstance = new (window as any).mapboxgl.Map({
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

      // Add nav controls
      mapInstance.addControl(
        new (window as any).mapboxgl.NavigationControl({ showCompass: false }),
        'bottom-right'
      );

      // Timeout: If map doesn't load in 8s, show error
      loadTimeout = setTimeout(() => {
        if (!didLoad) {
          setInitError("Map initialization timed out. Please try reloading.");
          console.error("[Map] Map loading timed out.");
          if (mapInstance) {
            try { mapInstance.remove(); } catch {}
            setMap(null);
          }
        }
      }, 8000);

      mapInstance.on('load', () => {
        didLoad = true;
        setMapLoaded(true);
        setMap(mapInstance);
        clearTimeout(loadTimeout);
        if (onMapLoaded) onMapLoaded(mapInstance);
        console.log("[Map] Map loaded fully.");
      });

      mapInstance.on('error', (e: any) => {
        let errMsg = "Map failed to load.";
        if (e?.error?.message) errMsg += ": " + e.error.message;
        setInitError(errMsg);
        setMapLoaded(false);
        clearTimeout(loadTimeout);
        try { mapInstance?.remove(); } catch {}
        setMap(null);
        console.error("[Map] Map error event:", e);
      });

      // Store reference for cleanup
      setMap(mapInstance);
    } catch (error: any) {
      setInitError("Failed to initialize map: " + (error?.message || error));
      setMapLoaded(false);
      setMap(null);
      console.error("[Map] Error during map init:", error);
    }

    // Cleanup
    return () => {
      clearTimeout(loadTimeout);
      if (mapInstance) {
        try { mapInstance.remove(); } catch (e) {}
      }
      setMap(null);
      setMapLoaded(false);
    };
    // NOTE: do NOT depend on onMapLoaded, it must not trigger re-init
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptsLoaded, containerRef, accessToken, JSON.stringify(center), zoom]);

  return { map, mapLoaded, scriptsLoaded, initError };
}
