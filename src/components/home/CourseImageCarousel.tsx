
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import type { EmblaCarouselType } from "embla-carousel";

interface CourseImageCarouselProps {
  images: string[];
  courseName: string;
  courseId: string;
}

const CourseImageCarousel = ({ images, courseName, courseId }: CourseImageCarouselProps) => {
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [api, setApi] = useState<EmblaCarouselType | null>(null);
  const [current, setCurrent] = useState(0);
  const isMobile = useIsMobile();
  
  // Initialize loaded state for images
  useEffect(() => {
    if (images.length) {
      setImagesLoaded(new Array(images.length).fill(false));
    }
  }, [images.length]);

  // Keep track of current slide
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  // Preload all images
  useEffect(() => {
    if (!images.length) return;
    
    images.forEach((src, index) => {
      if (!src) return;
      
      const img = new Image();
      
      img.onload = () => {
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
      
      img.onerror = () => {
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
      
      img.src = src;
    });
  }, [images]);

  // If there are no images, show a placeholder
  if (!images.length) {
    return (
      <div className="w-full h-48 bg-secondary/20 flex items-center justify-center text-muted-foreground">
        No hay imágenes disponibles
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <Carousel className="w-full" opts={{
        loop: true,
        align: "start",
      }} setApi={setApi}>
        <CarouselContent>
          {images.map((image, idx) => (
            <CarouselItem key={`${courseId}-${idx}`} className="basis-full">
              <div className="relative h-48 w-full">
                {/* Placeholder/loader while image loads */}
                {!imagesLoaded[idx] && (
                  <div className="absolute inset-0 bg-secondary/10 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                {/* The actual image with smooth transition */}
                <img
                  src={image}
                  alt={`${courseName} - imagen ${idx + 1}`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imagesLoaded[idx] ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => {
                    setImagesLoaded(prev => {
                      const newState = [...prev];
                      newState[idx] = true;
                      return newState;
                    });
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                    setImagesLoaded(prev => {
                      const newState = [...prev];
                      newState[idx] = true;
                      return newState;
                    });
                  }}
                />

                {/* Navigation dots positioned inside image at bottom - only for mobile */}
                {images.length > 1 && isMobile && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex justify-center gap-2">
                    {images.map((_, index) => (
                      <button
                        key={`dot-${index}`}
                        className="focus:outline-none"
                        onClick={() => api?.scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      >
                        <div 
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === current 
                              ? 'bg-white scale-110 shadow-md' 
                              : 'bg-white/60 scale-100'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {images.length > 1 && !isMobile && (
          <>
            <CarouselPrevious 
              className="left-2 h-8 w-8 lg:left-4"
              variant="outline"
            />
            <CarouselNext 
              className="right-2 h-8 w-8 lg:right-4"
              variant="outline"
            />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default CourseImageCarousel;
