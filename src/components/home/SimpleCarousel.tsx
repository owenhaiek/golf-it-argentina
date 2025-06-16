
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SimpleCarouselProps {
  images: string[];
  courseName: string;
  courseId: string;
}

const SimpleCarousel = ({ images, courseName, courseId }: SimpleCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const isMobile = useIsMobile();
  
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

  if (!images.length) {
    return (
      <div className="w-full h-48 bg-secondary/20 flex items-center justify-center text-muted-foreground rounded-lg">
        No hay imágenes disponibles
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-lg bg-secondary/20">
      {/* Images */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
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
              className={`w-full h-full object-cover transition-opacity duration-300 ${
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

      {/* Navigation arrows - only show if more than one image */}
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
    </div>
  );
};

export default SimpleCarousel;
