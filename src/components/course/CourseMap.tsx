
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Map, Globe } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSimpleMapbox } from "@/hooks/useSimpleMapbox";
import { useNavigate } from "react-router-dom";

interface CourseMapProps {
  latitude?: number | null;
  longitude?: number | null;
  name?: string;
  courseId?: string;
}

const MAPBOX_TOKEN = 'pk.eyJ1Ijoib3dlbmhhaWVrIiwiYSI6ImNtYW8zbWZpajAyeGsyaXB3Z2NrOG9yeWsifQ.EutakvlH6R5Hala3cVTEYw';

export const CourseMap = ({ latitude, longitude, name, courseId }: CourseMapProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const { map, isLoading, error } = useSimpleMapbox({
    containerRef: mapContainerRef,
    center: longitude && latitude ? [longitude, latitude] : [-58.3816, -34.6118],
    zoom: 15,
    accessToken: MAPBOX_TOKEN,
    onMapReady: (mapInstance) => {
      if (!latitude || !longitude) return;
      
      // Add green marker and popup
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

  const handleMapClick = () => {
    if (courseId) {
      navigate(`/courses-map?focus=${courseId}`);
    }
  };
  
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
        <div 
          className="bg-gray-200 h-[300px] rounded-md relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handleMapClick}
        >
          <div
            ref={mapContainerRef}
            className="absolute inset-0 w-full h-full"
          />
          
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 z-10">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-3 border-green-600/20"></div>
                <div className="absolute inset-0 rounded-full border-3 border-green-600 border-t-transparent animate-spin"></div>
                <Map className="absolute inset-0 w-5 h-5 m-auto text-green-600/70" />
              </div>
              <p className="text-sm text-muted-foreground mt-3">Loading map...</p>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 z-10">
              <Globe className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
              <p className="text-muted-foreground mb-3 text-center px-4 text-sm">{error}</p>
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
          {!error && !isLoading && (
            <div className="absolute bottom-1 right-1 text-[8px] text-muted-foreground bg-white/80 px-1 rounded">
              © Mapbox © OpenStreetMap
            </div>
          )}

          {/* Tap to open overlay */}
          {!error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-white/90 px-3 py-2 rounded-md text-sm font-medium">
                Tap to open in map
              </div>
            </div>
          )}
        </div>

        {courseId && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3"
            onClick={handleMapClick}
          >
            <Map className="w-4 h-4 mr-2" />
            Open in Map
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseMap;
