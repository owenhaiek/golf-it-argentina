
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, images.length, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, images.length, goToSlide]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || images.length <= 1) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setInitialTranslateX(translateX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const percentage = (diff / (carouselRef.current?.offsetWidth || 300)) * 100;
    setTranslateX(initialTranslateX + percentage);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isMobile) return;
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
    setIsDragging(true);
    setStartX(e.clientX);
    setInitialTranslateX(translateX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobile) return;
    const currentX = e.clientX;
    const diff = currentX - startX;
    const percentage = (diff / (carouselRef.current?.offsetWidth || 300)) * 100;
    setTranslateX(initialTranslateX + percentage);
  };

  const handleMouseUp = () => {
    if (!isDragging || isMobile) return;
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

  // Update translateX when currentIndex changes
  useEffect(() => {
    if (!isDragging) {
      setTranslateX(-currentIndex * 100);
    }
  }, [currentIndex, isDragging]);

  if (!images.length) {
    return (
      <div className="w-full h-48 bg-secondary/20 flex items-center justify-center text-muted-foreground rounded-lg">
        No hay imágenes disponibles
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-lg bg-secondary/20">
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
            {!imagesLoaded[index] && (
              <div className="absolute inset-0 bg-secondary/10 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={image}
              alt={`${courseName} - imagen ${index + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-300 select-none ${
                imagesLoaded[index] ? 'opacity-100' : 'opacity-0'
              }`}
              draggable={false}
              loading="lazy"
              onLoad={() =>
                setImagesLoaded(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                })
              }
              onError={e => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                setImagesLoaded(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                });
              }}
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
              onClick={() => goToSlide(index)}
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

      {/* Swipe indicator for mobile */}
      {isMobile && images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Desliza para ver más
        </div>
      )}
    </div>
  );
};

export default TouchCarousel;
