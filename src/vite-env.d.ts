
/// <reference types="vite/client" />

// Mapbox GL declarations
declare global {
  interface Window {
    mapboxgl: {
      Map: new (options: any) => any;
      NavigationControl: new (options?: any) => any;
      Marker: new (options?: any) => any;
      Popup: new (options?: any) => any;
      LngLatBounds: new () => any;
      accessToken: string;
    };
  }
}

export {};
