
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Map, Globe } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOptimizedMapbox } from "@/hooks/useOptimizedMapbox";

interface CourseMapProps {
  latitude?: number | null;
  longitude?: number | null;
  name?: string;
}

const MAPBOX_TOKEN = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';

export const CourseMap = ({ latitude, longitude, name }: CourseMapProps) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const { map, isLoading, error } = useOptimizedMapbox({
    containerRef: mapContainerRef,
    center: longitude && latitude ? [longitude, latitude] : [-58.3816, -34.6118],
    zoom: 15,
    accessToken: MAPBOX_TOKEN,
    onMapReady: (mapInstance) => {
      if (!latitude || !longitude) return;
      
      // Add marker and popup
      const marker = new (window as any).mapboxgl.Marker({
        color: '#10b981',
      })
        .setLngLat([longitude, latitude])
        .addTo(mapInstance);
      
      new (window as any).mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'bottom',
        offset: [0, -30],
      })
        .setLngLat([longitude, latitude])
        .setHTML(`<div class="font-medium text-xs">${name || 'Golf Course'}</div>`)
        .addTo(mapInstance);
    }
  });
  
  // Handle missing location data
  if (!latitude || !longitude) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("course", "courseLocation")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MapPin className="h-12 w-12 mb-2 opacity-20" />
          <p>{t("course", "mapNotAvailable")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t("course", "courseLocation")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted h-[300px] rounded-md relative overflow-hidden">
          <div
            ref={mapContainerRef}
            className="absolute inset-0 w-full h-full"
          />
          
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-3 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-3 border-primary border-t-transparent animate-spin"></div>
                <Map className="absolute inset-0 w-5 h-5 m-auto text-primary/70" />
              </div>
              <p className="text-sm text-muted-foreground mt-3">Loading map...</p>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
              <Globe className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
              <p className="text-muted-foreground mb-3 text-center px-4">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                {t("common", "tryAgain")}
              </Button>
            </div>
          )}
          
          {/* Map attribution */}
          <div className="absolute bottom-1 right-1 text-[8px] text-muted-foreground bg-white/80 px-1 rounded">
            © Mapbox © OpenStreetMap
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseMap;
