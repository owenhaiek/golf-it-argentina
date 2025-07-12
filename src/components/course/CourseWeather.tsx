
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ThermometerSnowflake,
  Wind,
  Tornado,
  Droplets,
  RefreshCw,
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

const getWeatherIcon = (code: number, isDay?: number) => {
  switch (code) {
    case 0:
      return isDay ? <ThermometerSun className="text-yellow-500" /> : <CloudFog className="text-blue-500" />;
    case 1:
    case 2:
      return <CloudSun className="text-yellow-400" />;
    case 3:
      return <Cloudy className="text-gray-400" />;
    case 45:
    case 48:
      return <CloudFog className="text-gray-400" />;
    case 51:
    case 53:
    case 55:
      return <CloudDrizzle className="text-blue-400" />;
    case 56:
    case 57:
      return <CloudDrizzle className="text-blue-400" />;
    case 61:
    case 63:
    case 65:
      return <CloudRain className="text-blue-500" />;
    case 66:
    case 67:
      return <CloudRain className="text-blue-600" />;
    case 71:
    case 73:
    case 75:
      return <CloudSnow className="text-blue-300" />;
    case 77:
      return <CloudHail className="text-blue-300" />;
    case 80:
    case 81:
    case 82:
      return <CloudRain className="text-blue-500" />;
    case 85:
    case 86:
      return <CloudSnow className="text-blue-300" />;
    case 95:
      return <CloudLightning className="text-yellow-400" />;
    case 96:
    case 99:
      return <CloudLightning className="text-red-500" />;
    default:
      return <Cloud className="text-gray-400" />;
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
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
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
      console.log(`Fetching weather for coordinates: ${lat}, ${lng}`);
      
      // Validate coordinates first
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error("Invalid coordinates");
      }
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const resp = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!resp.ok) {
        throw new Error(`Weather API error: ${resp.status}`);
      }
      
      const data = await resp.json();
      console.log("Weather API response:", data);
      
      if (!data.current || !data.daily) {
        throw new Error("Invalid weather data received");
      }
      
      // Current weather
      const curr = data.current;
      const weatherData: WeatherData = {
        temperature: Math.round(curr.temperature_2m || 0),
        description: getWeatherDesc(curr.weathercode || 0, t),
        humidity: Math.round(curr.relative_humidity_2m || 0),
        windSpeed: Math.round(curr.wind_speed_10m || 0),
        icon: getWeatherIcon(curr.weathercode || 0, curr.is_day),
      };
      
      // Forecast
      const daily = data.daily;
      const forecastData: ForecastData[] = daily.time.slice(0, 5).map((date: string, idx: number) => ({
        date: formatDate(date),
        min: Math.round(daily.temperature_2m_min[idx] || 0),
        max: Math.round(daily.temperature_2m_max[idx] || 0),
        icon: getWeatherIcon(daily.weathercode[idx] || 0, 1),
        desc: getWeatherDesc(daily.weathercode[idx] || 0, t),
      }));
      
      setWeather(weatherData);
      setForecast(forecastData);
      
    } catch (e: any) {
      console.error("Weather fetch error:", e);
      
      if (e.name === 'AbortError') {
        setError("Weather request timed out");
      } else {
        setError("Unable to load weather data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have valid coordinates
    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
    } else {
      console.log("No valid coordinates provided for weather");
      setError("Location coordinates not available");
      setLoading(false);
    }
  }, [latitude, longitude]);

  const handleRetry = () => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Cloudy className="w-6 h-6 text-primary" />
          {t("course", "weatherForecast")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <Cloud className="h-10 w-10 animate-spin text-primary mb-2" />
            <span className="text-muted-foreground">{t("course", "loadingWeather")}</span>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            <Tornado className="h-10 w-10 text-destructive mb-2" />
            <span className="text-destructive text-center">{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t("course", "tryAgain")}
            </Button>
          </div>
        )}

        {!loading && !error && weather && (
          <div>
            {/* Current conditions */}
            <div className="flex flex-col items-center mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{weather.icon}</span>
                <span className="text-4xl font-semibold">{weather.temperature}°C</span>
              </div>
              <div className="text-lg font-medium">{weather.description}</div>
              <div className="flex flex-row items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Droplets className="w-4 h-4" /> {weather.humidity}% {t("course", "humidity")}
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-4 h-4" /> {weather.windSpeed} km/h {t("course", "wind")}
                </div>
              </div>
            </div>

            {/* Forecast */}
            {forecast.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mt-4 mb-2 text-primary">{t("course", "dayForecast")}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {forecast.map((day, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex flex-col items-center p-2 rounded-md",
                        idx === 0 ? "bg-primary/10 font-semibold border border-primary/20" : "bg-muted/50"
                      )}
                    >
                      <div className="mb-1 text-xs text-muted-foreground">{day.date}</div>
                      <div className="text-xl">{day.icon}</div>
                      <div className="text-xs text-center">{day.desc}</div>
                      <div className="text-sm mt-1">
                        {day.max}° / <span className="text-muted-foreground">{day.min}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseWeather;
