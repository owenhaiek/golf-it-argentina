
import { Loader2 } from "lucide-react";

interface MapLoadingStateProps {
  coursesLoading: boolean;
  mapLoading: boolean;
}

export const MapLoadingState = ({ coursesLoading, mapLoading }: MapLoadingStateProps) => {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-green-700 font-medium">
          {coursesLoading ? 'Loading golf courses...' : 'Loading map...'}
        </p>
        <p className="text-green-600 text-sm mt-2">
          Please wait while we prepare the map...
        </p>
      </div>
    </div>
  );
};
