
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
  Droplets, // <-- added import here
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  // See https://open-meteo.com/en/docs#api_form for codes
  switch (code) {
    case 0: // Clear
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

const getWeatherDesc = (code: number) => {
  // Can be expanded, basic summary for codes
  switch (code) {
    case 0:
      return "Clear sky";
    case 1: return "Mainly clear";
    case 2: return "Partly cloudy";
    case 3: return "Cloudy";
    case 45: case 48: return "Fog";
    case 51: case 53: case 55: return "Drizzle";
    case 56: case 57: return "Freezing drizzle";
    case 61: case 63: case 65: return "Rain";
    case 66: case 67: return "Freezing rain";
    case 71: case 73: case 75: return "Snow";
    case 77: return "Snow grains";
    case 80: case 81: case 82: return "Rain showers";
    case 85: case 86: return "Snow showers";
    case 95: return "Thunderstorm";
    case 96: case 99: return "Thunderstorm with hail";
    default: return "Unknown";
  }
};

export const CourseWeather = ({ latitude, longitude }: CourseWeatherProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Format date for forecast
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  };

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setErr(null);
      try {
        // Daily & current
        const resp = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,humidity_2m,wind_speed_10m,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
        );
        if (!resp.ok) throw new Error("Weather fetch failed");
        const data = await resp.json();
        // Current (Open-Meteo returns 'current')
        const curr = data.current;
        const weather: WeatherData = {
          temperature: curr.temperature_2m,
          description: getWeatherDesc(curr.weathercode),
          humidity: curr.humidity_2m,
          windSpeed: curr.wind_speed_10m,
          icon: getWeatherIcon(curr.weathercode, curr.is_day),
        };
        // Forecast
        const daily = data.daily || {};
        const forecast: ForecastData[] = (daily.time || []).map((date: string, idx: number) => ({
          date: formatDate(date),
          min: Math.round(daily.temperature_2m_min[idx]),
          max: Math.round(daily.temperature_2m_max[idx]),
          icon: getWeatherIcon(daily.weathercode[idx], 1),
          desc: getWeatherDesc(daily.weathercode[idx]),
        }));
        setWeather(weather);
        setForecast(forecast);
      } catch (e) {
        setErr("Unable to load weather data. Please try again later.");
      }
      setLoading(false);
    };
    if (latitude && longitude) {
      fetchWeather();
    }
  }, [latitude, longitude]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Cloudy className="w-6 h-6 text-primary" />
          Weather Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <Cloud className="h-10 w-10 animate-spin text-primary mb-2" />
            <span className="text-muted-foreground">Loading weather...</span>
          </div>
        )}
        {err && (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <Tornado className="h-10 w-10 text-destructive mb-2" />
            <span className="text-destructive">{err}</span>
          </div>
        )}

        {!loading && !err && weather && (
          <div>
            {/* Current conditions */}
            <div className="flex flex-col items-center mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{weather.icon}</span>
                <span className="text-4xl font-semibold">{Math.round(weather.temperature)}°C</span>
              </div>
              <div className="text-lg font-medium">{weather.description}</div>
              <div className="flex flex-row items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Droplets className="w-4 h-4" /> {weather.humidity}% Humidity
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-4 h-4" /> {Math.round(weather.windSpeed)} km/h Wind
                </div>
              </div>
            </div>

            {/* Forecast */}
            {forecast.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mt-4 mb-2 text-primary">5-Day Forecast</h4>
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
                      <div className="text-xs">{day.desc}</div>
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
