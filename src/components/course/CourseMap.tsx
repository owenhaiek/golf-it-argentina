
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface CourseMapProps {
  latitude?: number | null;
  longitude?: number | null;
  name?: string;
}

export const CourseMap = ({ latitude, longitude, name }: CourseMapProps) => {
  if (!latitude || !longitude) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Course Location</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MapPin className="h-12 w-12 mb-2 opacity-20" />
          <p>Map location not available for this course</p>
        </CardContent>
      </Card>
    );
  }

  // For demonstration, displaying location coordinates 
  // In a real app, you'd integrate with a mapping service
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Course Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted h-[300px] rounded-md flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="flex flex-col items-center gap-2 text-center">
            <MapPin className="h-8 w-8 text-primary" />
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
            <p className="text-xs mt-2">Interactive map coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseMap;
