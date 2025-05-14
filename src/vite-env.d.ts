
/// <reference types="vite/client" />

// Mapbox GL declarations
interface MapboxGl {
  Map: any;
  NavigationControl: any;
  Marker: any;
  Popup: any;
  accessToken: string;
}

interface Window {
  mapboxgl: MapboxGl;
}
