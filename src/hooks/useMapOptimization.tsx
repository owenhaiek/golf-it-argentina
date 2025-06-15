
import { useState, useEffect, useRef } from 'react';

export const useMapOptimization = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const preloadedRef = useRef(false);

  // Preload Mapbox
  useEffect(() => {
    if (preloadedRef.current) return;
    
    const preloadMapbox = async () => {
      try {
        // Preload Mapbox CSS and JS if not already loaded
        if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
          document.head.appendChild(cssLink);
        }

        if (!window.mapboxgl && !document.querySelector('script[src*="mapbox-gl.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
          script.async = true;
          document.head.appendChild(script);
          
          script.onload = () => {
            preloadedRef.current = true;
          };
        } else {
          preloadedRef.current = true;
        }
      } catch (error) {
        console.error('Error preloading Mapbox:', error);
        setMapError('Failed to load map resources');
      }
    };

    preloadMapbox();
  }, []);

  const initializeMap = (container: HTMLElement, options: any) => {
    return new Promise((resolve, reject) => {
      try {
        if (mapInstanceRef.current) {
          resolve(mapInstanceRef.current);
          return;
        }

        const checkMapbox = () => {
          if (window.mapboxgl) {
            const map = new window.mapboxgl.Map({
              container,
              ...options,
              fadeDuration: 0, // Disable fade for faster loading
              attributionControl: false,
            });

            map.on('load', () => {
              setIsMapLoaded(true);
              mapInstanceRef.current = map;
              resolve(map);
            });

            map.on('error', (e: any) => {
              setMapError(e.error?.message || 'Map failed to load');
              reject(e);
            });
          } else {
            setTimeout(checkMapbox, 100);
          }
        };

        checkMapbox();
      } catch (error) {
        setMapError('Failed to initialize map');
        reject(error);
      }
    });
  };

  const resetMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    setIsMapLoaded(false);
    setMapError(null);
  };

  return {
    isMapLoaded,
    mapError,
    initializeMap,
    resetMap,
    mapInstance: mapInstanceRef.current
  };
};
