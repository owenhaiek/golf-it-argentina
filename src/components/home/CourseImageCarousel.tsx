
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem
} from "@/components/ui/carousel";
import type { EmblaCarouselType } from "embla-carousel";

// Embla options for improved mobile experience
const MOBILE_CAROUSEL_OPTS = {
  loop: true,
  align: "start",
  dragFree: true, // enables momentum/fling scrolling
  speed: 12, // fast and fluid
  containScroll: "trimSnaps"
};

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
  
  // Preload images
  useEffect(() => {
    if (images.length) setImagesLoaded(new Array(images.length).fill(false));
  }, [images.length]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!images.length) return;
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
  }, [images]);

  if (!images.length) {
    return (
      <div className="w-full h-48 bg-secondary/20 flex items-center justify-center text-muted-foreground">No hay imágenes disponibles</div>
    );
  }

  // Navigation handlers (kept outside scroll area for statics)
  const goPrev = () => api?.scrollPrev();
  const goNext = () => api?.scrollNext();

  return (
    <div className="w-full relative overflow-visible">
      {/* Carousel */}
      <Carousel
        className="w-full relative"
        opts={isMobile ? MOBILE_CAROUSEL_OPTS : { loop: true, align: "start" }}
        setApi={setApi}
      >
        {/* Next/Prev Navigation, always static at edges, visible only if multiple images and not mobile */}
        {(images.length > 1 && !isMobile) && (
          <>
            <button 
              className="absolute z-20 left-2 top-1/2 -translate-y-1/2 bg-background/70 rounded-full shadow p-2 hover:bg-background/90 transition-all"
              style={{ pointerEvents: "auto" }}
              onClick={goPrev}
              aria-label="Anterior"
              tabIndex={0}
            >
              <ChevronLeft className="h-7 w-7 text-primary" />
            </button>
            <button 
              className="absolute z-20 right-2 top-1/2 -translate-y-1/2 bg-background/70 rounded-full shadow p-2 hover:bg-background/90 transition-all"
              style={{ pointerEvents: "auto" }}
              onClick={goNext}
              aria-label="Siguiente"
              tabIndex={0}
            >
              <ChevronRight className="h-7 w-7 text-primary" />
            </button>
          </>
        )}

        <CarouselContent>
          {images.map((image, idx) => (
            <CarouselItem key={`${courseId}-${idx}`} className="basis-full">
              <div className="relative h-48 w-full touch-pan-y">
                {!imagesLoaded[idx] && (
                  <div className="absolute inset-0 bg-secondary/10 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={image}
                  alt={`${courseName} - imagen ${idx + 1}`}
                  className={`w-full h-full object-cover transition-opacity duration-200 ${imagesLoaded[idx] ? 'opacity-100' : 'opacity-0'}`}
                  draggable={false}
                  loading="lazy"
                  onLoad={() =>
                    setImagesLoaded(prev => {
                      const newState = [...prev];
                      newState[idx] = true;
                      return newState;
                    })
                  }
                  onError={e => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                    setImagesLoaded(prev => {
                      const newState = [...prev];
                      newState[idx] = true;
                      return newState;
                    });
                  }}
                  style={{ touchAction: "pan-y", WebkitUserDrag: "none" }}
                />
                {/* Dots only for mobile, static at image bottom */}
                {images.length > 1 && isMobile && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex justify-center gap-2 z-10">
                    {images.map((_, index) => (
                      <button
                        key={`dot-${index}`}
                        className="focus:outline-none"
                        onClick={() => api?.scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        tabIndex={0}
                      >
                        <div
                          className={`w-2 h-2 rounded-full transition-all ${
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
      </Carousel>
    </div>
  );
};

export default CourseImageCarousel;

