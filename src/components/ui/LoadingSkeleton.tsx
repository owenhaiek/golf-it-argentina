
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "default" | "circular" | "text";
}

export const LoadingSkeleton = ({ className, variant = "default" }: LoadingSkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 rounded",
        variant === "default" && "rounded-md",
        className
      )}
    />
  );
};

export const CourseCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border overflow-hidden">
    <LoadingSkeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <LoadingSkeleton className="h-6 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-4 w-1/4" />
        <LoadingSkeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  </div>
);

export const MapSkeleton = () => (
  <div className="h-full w-full bg-muted rounded-lg relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  </div>
);
