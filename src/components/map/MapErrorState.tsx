
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface MapErrorStateProps {
  mapError?: string | null;
  coursesError?: any;
  onRetry: () => void;
}

export const MapErrorState = ({ mapError, coursesError, onRetry }: MapErrorStateProps) => {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center p-6">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2 text-red-600">
            {mapError ? "Map Loading Error" : "Data Loading Error"}
          </h3>
          <p className="text-red-600 mb-4 text-sm">
            {mapError || (coursesError ? String(coursesError) : "Failed to load golf courses")}
          </p>
          <Button onClick={onRetry} className="bg-primary text-white hover:bg-primary/90">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
