import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Crosshair, Satellite, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

type MapStyleType = 'satellite' | 'street' | 'dark';

interface MapControlsProps {
  map: any;
  onStyleChange: (style: MapStyleType) => void;
  currentStyle: MapStyleType;
}

const getNextStyle = (current: MapStyleType): MapStyleType => {
  const order: MapStyleType[] = ['dark', 'satellite', 'street'];
  const currentIndex = order.indexOf(current);
  return order[(currentIndex + 1) % order.length];
};

const getStyleUrl = (style: MapStyleType): string => {
  switch (style) {
    case 'satellite': return 'mapbox://styles/mapbox/satellite-v9';
    case 'street': return 'mapbox://styles/mapbox/light-v11';
    case 'dark': 
    default: return 'mapbox://styles/mapbox/dark-v11';
  }
};

const getStyleIcon = (style: MapStyleType) => {
  switch (style) {
    case 'satellite': return Sun; // Next will be street (light)
    case 'street': return Moon; // Next will be dark
    case 'dark': 
    default: return Satellite; // Next will be satellite
  }
};

export const MapControls = ({ map, onStyleChange, currentStyle }: MapControlsProps) => {
  const [locationLoading, setLocationLoading] = useState(false);
  const [userMarker, setUserMarker] = useState<any>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleStyleToggle = () => {
    const newStyle = getNextStyle(currentStyle);
    const mapStyle = getStyleUrl(newStyle);
    
    if (map) {
      map.setStyle(mapStyle);
      onStyleChange(newStyle);
    }
  };

  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Ubicación no soportada",
        description: "Tu navegador no soporta geolocalización",
        variant: "destructive"
      });
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const location: [number, number] = [longitude, latitude];
        
        setLocationLoading(false);
        
        // Remove existing user marker
        if (userMarker) {
          userMarker.remove();
        }
        
        // Create user location marker with pulsing effect
        const el = document.createElement("div");
        el.innerHTML = `
          <style>
            @keyframes user-pulse {
              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
            }
          </style>
          <div style="
            position: relative;
            width: 20px;
            height: 20px;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              width: 40px;
              height: 40px;
              background: rgba(59, 130, 246, 0.3);
              border-radius: 50%;
              animation: user-pulse 2s infinite;
            "></div>
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              width: 20px;
              height: 20px;
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
            "></div>
          </div>
        `;
        
        const marker = new (window as any).mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat(location)
          .addTo(map);
        
        setUserMarker(marker);
        
        // Fly to user location
        map.flyTo({
          center: location,
          zoom: 14,
          duration: 1500
        });
        
        toast({
          title: "Ubicación encontrada",
          description: `Precisión: ${Math.round(accuracy)}m`
        });
      },
      (error) => {
        setLocationLoading(false);
        let message = "No se pudo obtener tu ubicación";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Acceso a ubicación denegado";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Ubicación no disponible";
            break;
          case error.TIMEOUT:
            message = "Tiempo de espera agotado";
            break;
        }
        
        toast({
          title: "Error de ubicación",
          description: message,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Cleanup user marker on unmount
  useEffect(() => {
    return () => {
      if (userMarker) {
        userMarker.remove();
      }
    };
  }, [userMarker]);

  const StyleIcon = getStyleIcon(currentStyle);

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {/* Map Style Toggle */}
      <Button
        onClick={handleStyleToggle}
        size={isMobile ? "icon" : "sm"}
        variant="secondary"
        className="bg-background/90 backdrop-blur-sm hover:bg-background border shadow-lg h-10 w-10 sm:w-auto sm:px-3"
        title={`Cambiar a ${currentStyle === 'dark' ? 'satélite' : currentStyle === 'satellite' ? 'calles' : 'oscuro'}`}
      >
        <StyleIcon className="w-4 h-4 sm:mr-2" />
        {!isMobile && (
          <span className="hidden sm:inline">
            {currentStyle === 'dark' ? 'Satélite' : currentStyle === 'satellite' ? 'Calles' : 'Oscuro'}
          </span>
        )}
      </Button>
      
      {/* My Location Button */}
      <Button
        onClick={handleFindMyLocation}
        size={isMobile ? "icon" : "sm"}
        variant="secondary"
        disabled={locationLoading}
        className="bg-background/90 backdrop-blur-sm hover:bg-background border shadow-lg h-10 w-10 sm:w-auto sm:px-3"
        title="Mi ubicación"
      >
        {locationLoading ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <Crosshair className="w-4 h-4 sm:mr-2" />
        )}
        {!isMobile && <span className="hidden sm:inline">Mi ubicación</span>}
      </Button>
    </div>
  );
};
