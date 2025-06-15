
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

interface OptimizedWeatherProps {
  latitude: number;
  longitude: number;
  location: string;
}

export const OptimizedWeather = ({ latitude, longitude, location }: OptimizedWeatherProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!latitude || !longitude) return;
      
      try {
        setLoading(true);
        setError(null);

        // Using Open-Meteo API (free, no API key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
        );

        if (!response.ok) {
          throw new Error('Weather service unavailable');
        }

        const data = await response.json();
        
        if (!data.current) {
          throw new Error('Invalid weather data');
        }

        const weatherConditions: { [key: number]: string } = {
          0: 'Clear sky',
          1: 'Mainly clear',
          2: 'Partly cloudy',
          3: 'Overcast',
          45: 'Foggy',
          48: 'Depositing rime fog',
          51: 'Light drizzle',
          61: 'Light rain',
          63: 'Moderate rain',
          65: 'Heavy rain',
          71: 'Light snow',
          73: 'Moderate snow',
          75: 'Heavy snow',
          80: 'Rain showers',
          95: 'Thunderstorm'
        };

        const condition = weatherConditions[data.current.weather_code] || 'Unknown';
        
        const forecast = data.daily.time.slice(0, 5).map((date: string, index: number) => ({
          day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          high: Math.round(data.daily.temperature_2m_max[index]),
          low: Math.round(data.daily.temperature_2m_min[index]),
          condition: weatherConditions[data.daily.weather_code[index]] || 'Unknown'
        }));

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          condition,
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m * 3.6), // Convert m/s to km/h
          forecast
        });
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load weather');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    } else if (conditionLower.includes('cloud')) {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    } else if (conditionLower.includes('snow')) {
      return <CloudSnow className="h-8 w-8 text-blue-300" />;
    }
    return <Cloud className="h-8 w-8 text-gray-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather in {location}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <LoadingSkeleton className="h-16 w-16" variant="circular" />
            <div className="text-right space-y-2">
              <LoadingSkeleton className="h-8 w-20" />
              <LoadingSkeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <LoadingSkeleton className="h-12" />
            <LoadingSkeleton className="h-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather in {location}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Weather in {location}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className="text-3xl font-bold">{weather.temperature}°C</div>
              <div className="text-muted-foreground">{weather.condition}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <span>Humidity: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <span>Wind: {weather.windSpeed} km/h</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2 text-xs">
            {weather.forecast.map((day, index) => (
              <div key={index} className="text-center">
                <div className="font-medium">{day.day}</div>
                <div className="my-1">{getWeatherIcon(day.condition)}</div>
                <div>{day.high}°/{day.low}°</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
