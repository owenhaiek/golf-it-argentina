
/// <reference types="vite/client" />

// Mapbox GL declarations
interface MapboxGl {
  Map: any;
  NavigationControl: any;
  Marker: any;
  Popup: any;
  accessToken: string;
  version?: string; // Add version as optional property
}

interface Window {
  mapboxgl: MapboxGl;
}
