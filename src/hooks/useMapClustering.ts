import { useRef, useCallback, useEffect } from "react";
import Supercluster from "supercluster";
import { createMarkerElement, validateCoordinates, setActiveMarker } from "@/utils/mapMarkers";
import { hapticLight } from "@/hooks/useDespiaNative";

interface GolfCourse {
  id: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  website?: string;
}

interface ClusterProperties {
  cluster: boolean;
  cluster_id?: number;
  point_count?: number;
  point_count_abbreviated?: string | number;
  courseId?: string;
  courseName?: string;
}

type GeoJSONFeature = GeoJSON.Feature<GeoJSON.Point, ClusterProperties>;

// Inject cluster marker styles
const injectClusterStyles = () => {
  if (document.getElementById('cluster-marker-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'cluster-marker-styles';
  style.textContent = `
    @keyframes cluster-pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
      }
      50% {
        transform: scale(1.02);
        box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
      }
    }
    
    .cluster-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 700;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.9);
      animation: cluster-pulse 3s ease-in-out infinite;
      will-change: transform;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    
    .cluster-marker:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(255, 255, 255, 1);
    }
    
    .cluster-marker:active {
      transform: scale(0.95) !important;
    }
    
    .cluster-marker-small {
      width: 40px;
      height: 40px;
      font-size: 14px;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    }
    
    .cluster-marker-medium {
      width: 50px;
      height: 50px;
      font-size: 16px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }
    
    .cluster-marker-large {
      width: 60px;
      height: 60px;
      font-size: 18px;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }
  `;
  document.head.appendChild(style);
};

const createClusterElement = (pointCount: number, onClick: () => void): HTMLElement => {
  injectClusterStyles();
  
  const el = document.createElement('div');
  
  let sizeClass = 'cluster-marker-small';
  if (pointCount >= 10 && pointCount < 25) {
    sizeClass = 'cluster-marker-medium';
  } else if (pointCount >= 25) {
    sizeClass = 'cluster-marker-large';
  }
  
  el.className = `cluster-marker ${sizeClass}`;
  el.innerHTML = `<span>${pointCount}</span>`;
  
  el.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    hapticLight();
    onClick();
  });
  
  return el;
};

export const useMapClustering = (onCourseSelect: (course: GolfCourse) => void) => {
  const markersRef = useRef<any[]>([]);
  const clusterRef = useRef<Supercluster<ClusterProperties, ClusterProperties> | null>(null);
  const coursesDataRef = useRef<GolfCourse[]>([]);
  const mapRef = useRef<any>(null);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      try {
        if (marker && typeof marker.remove === 'function') {
          marker.remove();
        }
      } catch (e) {
        console.warn("Error removing marker:", e);
      }
    });
    markersRef.current = [];
  }, []);

  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !clusterRef.current) return;

    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    clearMarkers();

    const bounds = mapRef.current.getBounds();
    const zoom = Math.floor(mapRef.current.getZoom());

    const clusters = clusterRef.current.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      zoom
    );

    clusters.forEach((feature: GeoJSONFeature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;

      if (props.cluster) {
        // Create cluster marker
        const clusterId = props.cluster_id!;
        const pointCount = props.point_count || 0;

        const clusterEl = createClusterElement(pointCount, () => {
          // Zoom into cluster
          const expansionZoom = Math.min(
            clusterRef.current!.getClusterExpansionZoom(clusterId),
            16
          );
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: expansionZoom,
            duration: 500
          });
        });

        const marker = new mapboxgl.Marker({
          element: clusterEl,
          anchor: 'center'
        })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      } else {
        // Create individual course marker
        const course = coursesDataRef.current.find(c => c.id === props.courseId);
        if (!course) return;

        const markerElement = createMarkerElement(course, onCourseSelect);

        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: 'center',
          pitchAlignment: 'map',
          rotationAlignment: 'map'
        })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      }
    });
  }, [clearMarkers, onCourseSelect]);

  const initializeClustering = useCallback((mapInstance: any, courses: GolfCourse[], shouldFitBounds = false) => {
    mapRef.current = mapInstance;
    coursesDataRef.current = courses;

    // Create GeoJSON features from courses
    const features: GeoJSONFeature[] = courses
      .filter(course => validateCoordinates(course.latitude, course.longitude))
      .map(course => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [Number(course.longitude), Number(course.latitude)]
        },
        properties: {
          cluster: false,
          courseId: course.id,
          courseName: course.name
        }
      }));

    if (features.length === 0) return;

    // Initialize supercluster
    clusterRef.current = new Supercluster<ClusterProperties, ClusterProperties>({
      radius: 60,
      maxZoom: 14,
      minZoom: 0
    });

    clusterRef.current.load(features);

    // Remove old event listeners before adding new ones
    mapInstance.off('moveend', updateMarkers);
    mapInstance.off('zoomend', updateMarkers);

    // Add event listeners for map movement
    mapInstance.on('moveend', updateMarkers);
    mapInstance.on('zoomend', updateMarkers);

    // Initial render
    updateMarkers();

    // Fit bounds if requested
    if (shouldFitBounds && features.length > 0) {
      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl) return;

      const bounds = new mapboxgl.LngLatBounds();
      features.forEach(f => {
        bounds.extend(f.geometry.coordinates as [number, number]);
      });

      setTimeout(() => {
        try {
          mapInstance.fitBounds(bounds, {
            padding: { top: 80, bottom: 80, left: 80, right: 80 },
            maxZoom: 12,
            duration: 1000
          });
        } catch (error) {
          console.warn("[Clustering] Error fitting bounds:", error);
        }
      }, 300);
    }
  }, [updateMarkers]);

  const focusOnCourse = useCallback((mapInstance: any, course: GolfCourse, onComplete?: () => void) => {
    if (!validateCoordinates(course.latitude, course.longitude)) {
      console.warn("Cannot focus on course with invalid coordinates:", course.name);
      return;
    }

    const coordinates: [number, number] = [Number(course.longitude), Number(course.latitude)];

    mapInstance.flyTo({
      center: coordinates,
      zoom: 15,
      duration: 1500,
      essential: true
    });

    // Set active marker after zoom completes
    setTimeout(() => {
      setActiveMarker(course.id);
      if (onComplete) onComplete();
    }, 1600);
  }, []);

  const cleanup = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.off('moveend', updateMarkers);
      mapRef.current.off('zoomend', updateMarkers);
    }
    clearMarkers();
    clusterRef.current = null;
    mapRef.current = null;
  }, [clearMarkers, updateMarkers]);

  return {
    initializeClustering,
    focusOnCourse,
    clearMarkers,
    cleanup,
    updateMarkers
  };
};
