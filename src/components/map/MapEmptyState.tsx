
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export const MapEmptyState = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm">
        <CardContent className="text-center p-6">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No golf courses found with location data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
