import { MapPin, Map, ExternalLink } from "lucide-react";
import { useRef } from "react";
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
export const CourseMap = ({
  latitude,
  longitude,
  name,
  courseId
}: CourseMapProps) => {
  const {
    t
  } = useLanguage();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const {
    map,
    isLoading,
    error
  } = useSimpleMapbox({
    containerRef: mapContainerRef,
    center: longitude && latitude ? [longitude, latitude] : [-58.3816, -34.6118],
    zoom: 14,
    accessToken: MAPBOX_TOKEN,
    mapStyle: 'dark',
    onMapReady: mapInstance => {
      if (!latitude || !longitude) return;

      // Create custom marker element matching app style
      const markerEl = document.createElement('div');
      markerEl.className = 'course-detail-marker';
      markerEl.innerHTML = `
        <div class="marker-inner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" x2="4" y1="22" y2="15"/>
          </svg>
        </div>
      `;

      // Add marker styles
      const styleId = 'course-detail-marker-style';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .course-detail-marker {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          .course-detail-marker .marker-inner {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4);
            animation: pulse-marker 2s ease-in-out infinite;
          }
          @keyframes pulse-marker {
            0%, 100% { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4); }
            50% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.2), 0 4px 16px rgba(0, 0, 0, 0.5); }
          }
        `;
        document.head.appendChild(style);
      }
      new (window as any).mapboxgl.Marker({
        element: markerEl,
        anchor: 'center'
      }).setLngLat([longitude, latitude]).addTo(mapInstance);
    }
  });
  const handleMapClick = () => {
    if (courseId) {
      navigate(`/courses-map?focus=${courseId}`);
    }
  };

  // Handle missing location data
  if (!latitude || !longitude) {
    return <div className="bg-zinc-900 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-white">{t("course", "courseLocation")}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-zinc-800/50 rounded-xl">
          <MapPin className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">{t("course", "mapNotAvailable")}</p>
        </div>
      </div>;
  }
  return <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-white">{t("course", "courseLocation")}</h3>
        </div>
        {courseId}
      </div>
      
      <div className="h-[220px] sm:h-[280px] rounded-xl relative overflow-hidden cursor-pointer group" onClick={handleMapClick}>
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        
        {/* Loading state */}
        {isLoading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 z-10">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
              <Map className="absolute inset-0 w-5 h-5 m-auto text-emerald-500/70" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Cargando mapa...</p>
          </div>}
        
        {/* Error state */}
        {error && <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 z-10">
            <MapPin className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
            <p className="text-muted-foreground text-sm text-center px-4">{error}</p>
          </div>}
        
        {/* Hover overlay */}
        {!error && !isLoading && <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-zinc-900/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white flex items-center gap-2">
              <Map className="w-4 h-4" />
              Abrir en mapa
            </div>
          </div>}
      </div>
    </div>;
};
export default CourseMap;