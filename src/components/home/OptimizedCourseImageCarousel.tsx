
import { memo } from "react";
import { useOptimizedCarousel } from "@/hooks/useOptimizedCarousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OptimizedCourseImageCarouselProps {
  images: string[];
  courseName: string;
  onImageLoad?: () => void;
}

export const OptimizedCourseImageCarousel = memo(({ 
  images, 
  courseName,
  onImageLoad 
}: OptimizedCourseImageCarouselProps) => {
  const {
    currentSlide,
    isTransitioning,
    goToSlide,
    goToNext,
    goToPrevious,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    pauseAutoPlay,
    resumeAutoPlay
  } = useOptimizedCarousel({
    totalSlides: images.length,
    autoPlayDelay: 5000,
    enableAutoPlay: true
  });

  if (!images.length) {
    return (
      <div className="w-full h-48 bg-muted rounded-t-xl flex items-center justify-center">
        <span className="text-muted-foreground">No images available</span>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-48 overflow-hidden rounded-t-xl group"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image Container */}
      <div 
        className="flex transition-transform duration-300 ease-out h-full"
        style={{ 
          transform: `translateX(-${currentSlide * 100}%)`,
          willChange: isTransitioning ? 'transform' : 'auto'
        }}
      >
        {images.map((image, index) => (
          <div key={index} className="flex-shrink-0 w-full h-full relative">
            <img
              src={image}
              alt={`${courseName} - Image ${index + 1}`}
              className="w-full h-full object-cover"
              loading={Math.abs(index - currentSlide) <= 1 ? "eager" : "lazy"}
              onLoad={onImageLoad}
              style={{
                transform: `scale(${index === currentSlide ? 1 : 1.05})`,
                transition: 'transform 0.3s ease-out'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Navigation Dots - Inside image at bottom */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

OptimizedCourseImageCarousel.displayName = "OptimizedCourseImageCarousel";
