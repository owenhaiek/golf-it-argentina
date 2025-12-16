import { useState, useEffect } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  ThermometerSun,
  Wind,
  Droplets,
  RefreshCw,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: JSX.Element;
}

interface ForecastData {
  date: string;
  min: number;
  max: number;
  icon: JSX.Element;
  desc: string;
}

interface CourseWeatherProps {
  latitude: number;
  longitude: number;
}

const getWeatherIcon = (code: number, isDay?: number, size: string = "w-6 h-6") => {
  const iconClass = size;
  switch (code) {
    case 0:
      return isDay ? <Sun className={`${iconClass} text-amber-400`} /> : <CloudFog className={`${iconClass} text-blue-400`} />;
    case 1:
    case 2:
      return <CloudSun className={`${iconClass} text-amber-400`} />;
    case 3:
      return <Cloudy className={`${iconClass} text-zinc-400`} />;
    case 45:
    case 48:
      return <CloudFog className={`${iconClass} text-zinc-400`} />;
    case 51:
    case 53:
    case 55:
      return <CloudDrizzle className={`${iconClass} text-blue-400`} />;
    case 56:
    case 57:
      return <CloudDrizzle className={`${iconClass} text-blue-400`} />;
    case 61:
    case 63:
    case 65:
      return <CloudRain className={`${iconClass} text-blue-500`} />;
    case 66:
    case 67:
      return <CloudRain className={`${iconClass} text-blue-600`} />;
    case 71:
    case 73:
    case 75:
      return <CloudSnow className={`${iconClass} text-blue-300`} />;
    case 77:
      return <CloudHail className={`${iconClass} text-blue-300`} />;
    case 80:
    case 81:
    case 82:
      return <CloudRain className={`${iconClass} text-blue-500`} />;
    case 85:
    case 86:
      return <CloudSnow className={`${iconClass} text-blue-300`} />;
    case 95:
      return <CloudLightning className={`${iconClass} text-amber-400`} />;
    case 96:
    case 99:
      return <CloudLightning className={`${iconClass} text-red-500`} />;
    default:
      return <Cloud className={`${iconClass} text-zinc-400`} />;
  }
};

const getWeatherDesc = (code: number, t: (section: string, key: string) => string) => {
  switch (code) {
    case 0: return t("course", "sunny");
    case 1: return t("course", "sunny");
    case 2: return t("course", "partlyCloudy");
    case 3: return t("course", "cloudy");
    case 45: case 48: return t("course", "fog");
    case 51: case 53: case 55: return t("course", "drizzle");
    case 56: case 57: return t("course", "drizzle");
    case 61: case 63: case 65: return t("course", "rain");
    case 66: case 67: return t("course", "rain");
    case 71: case 73: case 75: return t("course", "snow");
    case 77: return t("course", "snow");
    case 80: case 81: case 82: return t("course", "rain");
    case 85: case 86: return t("course", "snow");
    case 95: return t("course", "thunderstorm");
    case 96: case 99: return t("course", "thunderstorm");
    default: return "Unknown";
  }
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('es-ES', { weekday: "short", day: "numeric" });
};

export const CourseWeather = ({ latitude, longitude }: CourseWeatherProps) => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    
    try {
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error("Invalid coordinates");
      }
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const resp = await fetch(url, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!resp.ok) throw new Error(`Weather API error: ${resp.status}`);
      
      const data = await resp.json();
      
      if (!data.current || !data.daily) throw new Error("Invalid weather data received");
      
      const curr = data.current;
      const weatherData: WeatherData = {
        temperature: Math.round(curr.temperature_2m || 0),
        description: getWeatherDesc(curr.weathercode || 0, t),
        humidity: Math.round(curr.relative_humidity_2m || 0),
        windSpeed: Math.round(curr.wind_speed_10m || 0),
        icon: getWeatherIcon(curr.weathercode || 0, curr.is_day, "w-10 h-10"),
      };
      
      const daily = data.daily;
      const forecastData: ForecastData[] = daily.time.slice(0, 5).map((date: string, idx: number) => ({
        date: formatDate(date),
        min: Math.round(daily.temperature_2m_min[idx] || 0),
        max: Math.round(daily.temperature_2m_max[idx] || 0),
        icon: getWeatherIcon(daily.weathercode[idx] || 0, 1, "w-6 h-6"),
        desc: getWeatherDesc(daily.weathercode[idx] || 0, t),
      }));
      
      setWeather(weatherData);
      setForecast(forecastData);
      
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setError("Tiempo de espera agotado");
      } else {
        setError("No se pudo cargar el clima");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
    } else {
      setError("Coordenadas no disponibles");
      setLoading(false);
    }
  }, [latitude, longitude]);

  const handleRetry = () => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Weather */}
      <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Cloudy className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-white">{t("course", "weatherForecast")}</h3>
        </div>
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative w-12 h-12 mb-3">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              <Cloud className="absolute inset-0 w-5 h-5 m-auto text-blue-400" />
            </div>
            <span className="text-zinc-400 text-sm">{t("course", "loadingWeather")}</span>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center py-10">
            <CloudRain className="h-12 w-12 text-zinc-600 mb-3" />
            <span className="text-zinc-400 text-sm mb-4">{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("course", "tryAgain")}
            </Button>
          </div>
        )}

        {!loading && !error && weather && (
          <div>
            {/* Current conditions */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
                {weather.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{weather.temperature}</span>
                  <span className="text-xl text-zinc-400">°C</span>
                </div>
                <p className="text-zinc-400 text-sm">{weather.description}</p>
              </div>
            </div>
            
            {/* Weather details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{weather.humidity}%</p>
                  <p className="text-xs text-zinc-500">{t("course", "humidity")}</p>
                </div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Wind className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{weather.windSpeed}</p>
                  <p className="text-xs text-zinc-500">km/h</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5-Day Forecast */}
      {!loading && !error && forecast.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <ThermometerSun className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-white">{t("course", "dayForecast")}</h3>
          </div>
          
          <div className="space-y-2">
            {forecast.map((day, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-colors",
                  idx === 0 ? "bg-zinc-800/70" : "bg-zinc-800/30"
                )}
              >
                <div className="w-12 text-center">
                  <span className={cn(
                    "text-xs font-medium",
                    idx === 0 ? "text-emerald-400" : "text-zinc-400"
                  )}>
                    {idx === 0 ? "Hoy" : day.date}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-zinc-700/50 flex items-center justify-center">
                  {day.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 truncate">{day.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-white">{day.max}°</span>
                  <span className="text-sm text-zinc-500 mx-1">/</span>
                  <span className="text-sm text-zinc-500">{day.min}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseWeather;