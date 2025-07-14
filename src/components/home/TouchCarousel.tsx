
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface TouchCarouselProps {
  images: string[];
  courseName: string;
  courseId: string;
}

const TouchCarousel = ({ images, courseName, courseId }: TouchCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [initialTranslateX, setInitialTranslateX] = useState(0);
  const isMobile = useIsMobile();
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Preload images
  useEffect(() => {
    if (images.length) {
      setImagesLoaded(new Array(images.length).fill(false));
      images.forEach((src, index) => {
        if (!src) return;
        const img = new window.Image();
        img.onload = () => setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
        img.onerror = () => setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
        img.src = src;
      });
    }
  }, [images]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
      setTranslateX(-index * 100);
    }
  }, [images.length]);

  const goToPrevious = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, images.length, goToSlide]);

  const goToNext = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, images.length, goToSlide]);

  // Touch handlers with better touch handling to prevent page scroll
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || images.length <= 1) return;
    
    // Prevent page scrolling when touching the carousel
    e.stopPropagation();
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setInitialTranslateX(translateX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    
    // Prevent page scrolling during carousel swipe
    e.preventDefault();
    e.stopPropagation();
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const percentage = (diff / (carouselRef.current?.offsetWidth || 300)) * 100;
    setTranslateX(initialTranslateX + percentage);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    
    e.stopPropagation();
    setIsDragging(false);
    
    const diff = translateX - initialTranslateX;
    const threshold = 20; // 20% threshold
    
    if (diff > threshold) {
      goToPrevious();
    } else if (diff < -threshold) {
      goToNext();
    } else {
      // Snap back to current slide
      setTranslateX(-currentIndex * 100);
    }
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile || images.length <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartX(e.clientX);
    setInitialTranslateX(translateX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    const currentX = e.clientX;
    const diff = currentX - startX;
    const percentage = (diff / (carouselRef.current?.offsetWidth || 300)) * 100;
    setTranslateX(initialTranslateX + percentage);
  };

  const handleMouseUp = (e?: React.MouseEvent) => {
    if (!isDragging || isMobile) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
    
    const diff = translateX - initialTranslateX;
    const threshold = 20;
    
    if (diff > threshold) {
      goToPrevious();
    } else if (diff < -threshold) {
      goToNext();
    } else {
      setTranslateX(-currentIndex * 100);
    }
  };

  // Handle dot clicks
  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    goToSlide(index);
  };

  // Update translateX when currentIndex changes
  useEffect(() => {
    if (!isDragging) {
      setTranslateX(-currentIndex * 100);
    }
  }, [currentIndex, isDragging]);

  if (!images.length) {
    return (
      <div className="w-full h-48 bg-secondary/20 flex items-center justify-center text-muted-foreground rounded-t-lg">
        No hay imágenes disponibles
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-secondary/20">
      {/* Images */}
      <div 
        ref={carouselRef}
        className={`flex h-full ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
        style={{ transform: `translateX(${translateX}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {images.map((image, index) => (
          <div key={`${courseId}-${index}`} className="w-full h-full flex-shrink-0 relative">
            <OptimizedImage
              src={image}
              alt={`${courseName} - imagen ${index + 1}`}
              className="w-full h-full object-cover select-none"
              priority={index === 0} // Prioritize first image
              onLoad={() =>
                setImagesLoaded(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                })
              }
              onError={() =>
                setImagesLoaded(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                })
              }
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows - show on desktop */}
      {images.length > 1 && !isMobile && (
        <>
          <button 
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg p-2 hover:bg-white/90 transition-all duration-200"
            onClick={goToPrevious}
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-4 w-4 text-gray-800" />
          </button>
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg p-2 hover:bg-white/90 transition-all duration-200"
            onClick={goToNext}
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="h-4 w-4 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={`dot-${index}`}
              className="focus:outline-none"
              onClick={(e) => handleDotClick(e, index)}
              aria-label={`Ir a imagen ${index + 1}`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-white scale-110 shadow-md' 
                    : 'bg-white/60 scale-100'
                }`} 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TouchCarousel;
