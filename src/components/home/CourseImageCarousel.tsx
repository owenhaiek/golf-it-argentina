
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
  const [isLoaded, setIsLoaded] = useState<boolean[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Minimum swipe distance required (in px)
  const minSwipeDistance = 50;

  // Initialize loaded state for all images
  useEffect(() => {
    setIsLoaded(new Array(images.length).fill(false));
  }, [images.length]);

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Pre-load previous image to avoid white flash
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    
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
    
    setCurrentImageIndex(nextIndex);
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Pre-load all images when component mounts
  useEffect(() => {
    const imagePromises = images.map((src, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          setIsLoaded(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
          resolve();
        };
        img.onerror = () => {
          // Mark as loaded even on error to avoid infinite loading state
          setIsLoaded(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
          resolve();
        };
        img.src = src;
      });
    });

    Promise.all(imagePromises);
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
            {/* El placeholder toma el lugar hasta que la imagen real se carga */}
            <div 
              className={`w-full h-full bg-secondary/10 flex items-center justify-center transition-opacity duration-300 ${isLoaded[idx] ? 'hidden' : 'flex'}`}
            >
              <div className="w-6 h-6 border-2 border-primary/30 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <img
              src={image}
              alt={`${courseName} - imagen ${idx + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded[idx] ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => {
                setIsLoaded(prev => {
                  const newState = [...prev];
                  newState[idx] = true;
                  return newState;
                });
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                setIsLoaded(prev => {
                  const newState = [...prev];
                  newState[idx] = true;
                  return newState;
                });
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
