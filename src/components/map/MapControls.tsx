import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Map, Crosshair, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MapControlsProps {
  map: any;
  onStyleChange: (style: 'satellite' | 'street') => void;
  currentStyle: 'satellite' | 'street';
}

export const MapControls = ({ map, onStyleChange, currentStyle }: MapControlsProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userMarker, setUserMarker] = useState<any>(null);
  const { toast } = useToast();

  const handleStyleToggle = () => {
    const newStyle = currentStyle === 'satellite' ? 'street' : 'satellite';
    const mapStyle = newStyle === 'satellite' 
      ? 'mapbox://styles/mapbox/satellite-v9' 
      : 'mapbox://styles/mapbox/light-v11';
    
    if (map) {
      map.setStyle(mapStyle);
      onStyleChange(newStyle);
    }
  };

  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const location: [number, number] = [longitude, latitude];
        
        setUserLocation(location);
        setLocationLoading(false);
        
        // Remove existing user marker
        if (userMarker) {
          userMarker.remove();
        }
        
        // Create user location marker
        const el = document.createElement("div");
        el.style.cssText = `
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
          position: relative;
        `;
        
        // Add pulsing effect
        const pulse = document.createElement("div");
        pulse.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40px;
          height: 40px;
          border: 2px solid rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
        `;
        el.appendChild(pulse);
        
        // Add CSS animation
        if (!document.getElementById('user-location-pulse')) {
          const style = document.createElement('style');
          style.id = 'user-location-pulse';
          style.textContent = `
            @keyframes pulse {
              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }
        
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
          zoom: 15,
          duration: 2000
        });
        
        toast({
          title: "Location found",
          description: `Accuracy: ${Math.round(accuracy)}m`
        });
      },
      (error) => {
        setLocationLoading(false);
        let message = "Unable to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location error",
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

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {/* Map Style Toggle */}
      <Button
        onClick={handleStyleToggle}
        size="sm"
        variant="secondary"
        className="bg-white/90 backdrop-blur-sm hover:bg-white border shadow-lg text-black"
      >
        <Map className="w-4 h-4 mr-2 text-black" />
        {currentStyle === 'satellite' ? 'Street' : 'Satellite'}
      </Button>
      
      {/* My Location Button */}
      <Button
        onClick={handleFindMyLocation}
        size="sm"
        variant="secondary"
        disabled={locationLoading}
        className="bg-white/90 backdrop-blur-sm hover:bg-white border shadow-lg text-black"
      >
        {locationLoading ? (
          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-black border-t-transparent" />
        ) : (
          <Crosshair className="w-4 h-4 mr-2 text-black" />
        )}
        My Location
      </Button>
    </div>
  );
};