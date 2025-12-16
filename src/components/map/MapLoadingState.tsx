
interface MapLoadingStateProps {
  coursesLoading: boolean;
  mapLoading: boolean;
}

export const MapLoadingState = ({ coursesLoading, mapLoading }: MapLoadingStateProps) => {
  return (
    <div 
      className="h-screen flex items-center justify-center"
      style={{ backgroundColor: '#092820' }}
    >
      <div className="flex flex-col items-center gap-6">
        <img 
          src="/lovable-uploads/3dc401b2-fdd6-4815-a300-aa3c9b61ed9d.png" 
          alt="GolfIt" 
          className="w-20 h-20 object-contain animate-pulse"
        />
        <div className="flex gap-1.5">
          <div 
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '100ms' }}
          />
          <div 
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '200ms' }}
          />
        </div>
      </div>
    </div>
  );
};
