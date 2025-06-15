
import { OptimizedWeather } from "./OptimizedWeather";

interface CourseWeatherProps {
  latitude: number | null;
  longitude: number | null;
  location: string;
}

const CourseWeather = ({ latitude, longitude, location }: CourseWeatherProps) => {
  if (!latitude || !longitude) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Weather Information</h3>
        <p className="text-muted-foreground">
          Weather data is not available for this location.
        </p>
      </div>
    );
  }

  return (
    <OptimizedWeather 
      latitude={latitude} 
      longitude={longitude} 
      location={location} 
    />
  );
};

export default CourseWeather;
