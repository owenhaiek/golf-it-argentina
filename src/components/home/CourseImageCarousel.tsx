
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CourseImageCarouselProps {
  images: string[];
  courseName: string;
  courseId: string;
}

const CourseImageCarousel = ({ images, courseName, courseId }: CourseImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Minimum swipe distance required (in px)
  const minSwipeDistance = 50;

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Pre-load previous image to avoid white flash
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    const img = new Image();
    img.src = images[prevIndex];
    
    setCurrentImageIndex(prevIndex);
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Pre-load next image to avoid white flash
    const nextIndex = (currentImageIndex + 1) % images.length;
    const img = new Image();
    img.src = images[nextIndex];
    
    setCurrentImageIndex(nextIndex);
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Pre-load all images when component mounts
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  // Touch event handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNextImage();
    }
    
    if (isRightSwipe) {
      handlePrevImage();
    }
  };

  // Auto-play carousel
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      handleNextImage();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length, currentImageIndex]);

  return (
    <div className="relative overflow-hidden">
      <div 
        ref={carouselRef}
        className="flex transition-transform duration-300 ease-in-out h-48"
        style={{ 
          transform: `translateX(-${currentImageIndex * 100}%)`,
          width: `${images.length * 100}%`
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {images.map((image, idx) => (
          <div 
            key={`${courseId}-${idx}`} 
            className="w-full h-full flex-shrink-0"
            style={{ width: `${100 / images.length}%` }}
          >
            <img
              src={image}
              alt={`${courseName} - imagen ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
              }}
            />
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          {!isMobile && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors z-10"
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors z-10"
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center z-10">
            <div className="flex gap-1">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseImageCarousel;
