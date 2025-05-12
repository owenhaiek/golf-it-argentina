
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun } from "lucide-react";

interface CourseWeatherProps {
  latitude?: number | null;
  longitude?: number | null;
}

export const CourseWeather = ({ latitude, longitude }: CourseWeatherProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Weather Forecast</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Sun className="h-12 w-12 mb-2 opacity-20" />
        <p>Weather information coming soon</p>
      </CardContent>
    </Card>
  );
};

export default CourseWeather;
