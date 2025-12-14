import { useRef, useCallback, useEffect } from "react";
import { validateCoordinates, resetMarkerIndex } from "@/utils/mapMarkers";

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

const SOURCE_ID = 'golf-courses-source';
const CLUSTER_LAYER_ID = 'clusters';
const CLUSTER_COUNT_LAYER_ID = 'cluster-count';
const UNCLUSTERED_LAYER_ID = 'unclustered-point';

export const useClusteredMarkers = (onCourseSelect: (course: GolfCourse) => void) => {
  const coursesDataRef = useRef<GolfCourse[]>([]);
  const isInitializedRef = useRef(false);

  const injectClusterStyles = useCallback(() => {
    if (document.getElementById('cluster-marker-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cluster-marker-styles';
    style.textContent = `
      .mapboxgl-popup-content {
        background: hsl(var(--background)) !important;
        border: 1px solid hsl(var(--border)) !important;
        border-radius: 12px !important;
        padding: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;
      }
      .mapboxgl-popup-tip {
        border-top-color: hsl(var(--background)) !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const setupClusterLayers = useCallback((mapInstance: any, courses: GolfCourse[]) => {
    if (!mapInstance || courses.length === 0) return;

    console.log("[ClusteredMarkers] Setting up clusters for", courses.length, "courses");
    injectClusterStyles();
    
    // Store courses data for click handling
    coursesDataRef.current = courses;

    // Remove existing layers and source if they exist
    try {
      if (mapInstance.getLayer(CLUSTER_COUNT_LAYER_ID)) mapInstance.removeLayer(CLUSTER_COUNT_LAYER_ID);
      if (mapInstance.getLayer(CLUSTER_LAYER_ID)) mapInstance.removeLayer(CLUSTER_LAYER_ID);
      if (mapInstance.getLayer(UNCLUSTERED_LAYER_ID)) mapInstance.removeLayer(UNCLUSTERED_LAYER_ID);
      if (mapInstance.getSource(SOURCE_ID)) mapInstance.removeSource(SOURCE_ID);
    } catch (e) {
      console.warn("[ClusteredMarkers] Error cleaning up:", e);
    }

    // Create GeoJSON data
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: courses
        .filter(course => validateCoordinates(course.latitude, course.longitude))
        .map(course => ({
          type: 'Feature' as const,
          properties: {
            id: course.id,
            name: course.name,
            city: course.city || '',
            holes: course.holes,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [Number(course.longitude), Number(course.latitude)]
          }
        }))
    };

    // Add source with clustering
    mapInstance.addSource(SOURCE_ID, {
      type: 'geojson',
      data: geojsonData,
      cluster: true,
      clusterMaxZoom: 12,
      clusterRadius: 60
    });

    // Cluster circles layer
    mapInstance.addLayer({
      id: CLUSTER_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#22c55e', // green for small clusters
          10, '#16a34a', // darker green for medium
          30, '#15803d' // darkest for large
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          24,
          10, 30,
          30, 36
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.9
      }
    });

    // Cluster count labels
    mapInstance.addLayer({
      id: CLUSTER_COUNT_LAYER_ID,
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Individual point layer (unclustered)
    mapInstance.addLayer({
      id: UNCLUSTERED_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#22c55e',
        'circle-radius': 14,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.95
      }
    });

    // Add a symbol layer for the golf flag icon on unclustered points
    mapInstance.addLayer({
      id: 'unclustered-icon',
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': '⛳',
        'text-size': 12,
        'text-allow-overlap': true
      }
    });

    // Click handler for clusters - zoom in
    mapInstance.on('click', CLUSTER_LAYER_ID, (e: any) => {
      const features = mapInstance.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER_ID] });
      const clusterId = features[0].properties.cluster_id;
      
      mapInstance.getSource(SOURCE_ID).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        
        mapInstance.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
          duration: 500
        });
      });
    });

    // Click handler for individual points
    mapInstance.on('click', UNCLUSTERED_LAYER_ID, (e: any) => {
      const features = mapInstance.queryRenderedFeatures(e.point, { layers: [UNCLUSTERED_LAYER_ID] });
      if (features.length === 0) return;
      
      const courseId = features[0].properties.id;
      const course = coursesDataRef.current.find(c => c.id === courseId);
      
      if (course) {
        console.log("[ClusteredMarkers] Course clicked:", course.name);
        onCourseSelect(course);
        
        // Center on the course
        mapInstance.easeTo({
          center: [Number(course.longitude), Number(course.latitude)],
          zoom: 15,
          duration: 800
        });
      }
    });

    // Change cursor on hover
    mapInstance.on('mouseenter', CLUSTER_LAYER_ID, () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', CLUSTER_LAYER_ID, () => {
      mapInstance.getCanvas().style.cursor = '';
    });
    mapInstance.on('mouseenter', UNCLUSTERED_LAYER_ID, () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', UNCLUSTERED_LAYER_ID, () => {
      mapInstance.getCanvas().style.cursor = '';
    });

    isInitializedRef.current = true;
    console.log("[ClusteredMarkers] Clustering setup complete");
  }, [onCourseSelect, injectClusterStyles]);

  const focusOnCourse = useCallback((mapInstance: any, course: GolfCourse, onComplete?: () => void) => {
    if (!validateCoordinates(course.latitude, course.longitude)) {
      console.warn("Cannot focus on course with invalid coordinates:", course.name);
      return;
    }

    const coordinates: [number, number] = [Number(course.longitude), Number(course.latitude)];
    console.log("[ClusteredMarkers] Focusing on course:", course.name);

    mapInstance.flyTo({
      center: coordinates,
      zoom: 15,
      duration: 1500,
      essential: true
    });

    if (onComplete) {
      setTimeout(onComplete, 1800);
    }
  }, []);

  const cleanup = useCallback((mapInstance: any) => {
    if (!mapInstance) return;
    
    try {
      if (mapInstance.getLayer('unclustered-icon')) mapInstance.removeLayer('unclustered-icon');
      if (mapInstance.getLayer(CLUSTER_COUNT_LAYER_ID)) mapInstance.removeLayer(CLUSTER_COUNT_LAYER_ID);
      if (mapInstance.getLayer(CLUSTER_LAYER_ID)) mapInstance.removeLayer(CLUSTER_LAYER_ID);
      if (mapInstance.getLayer(UNCLUSTERED_LAYER_ID)) mapInstance.removeLayer(UNCLUSTERED_LAYER_ID);
      if (mapInstance.getSource(SOURCE_ID)) mapInstance.removeSource(SOURCE_ID);
    } catch (e) {
      console.warn("[ClusteredMarkers] Cleanup error:", e);
    }
    
    isInitializedRef.current = false;
  }, []);

  return {
    setupClusterLayers,
    focusOnCourse,
    cleanup,
    isInitialized: isInitializedRef.current
  };
};
