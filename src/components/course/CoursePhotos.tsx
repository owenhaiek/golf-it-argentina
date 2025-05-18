import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { EmblaCarouselType } from "embla-carousel";

interface CoursePhotosProps {
  courseId: string;
  courseName: string;
  galleryString?: string;
  mainImageUrl?: string;
}

const CoursePhotos = ({ courseId, courseName, galleryString, mainImageUrl }: CoursePhotosProps) => {
  const [api, setApi] = useState<EmblaCarouselType | null>(null);
  const [current, setCurrent] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const isMobile = useIsMobile();
  
  // Parse gallery string to array
  const galleryImages = galleryString
    ? galleryString.split(',').map(url => url.trim()).filter(url => url)
    : [];
    
  // Include main image if it exists and isn't already in gallery
  const allImages = mainImageUrl 
    ? [mainImageUrl, ...galleryImages.filter(url => url !== mainImageUrl)]
    : galleryImages;
  
  // Initialize loaded state for images
  useEffect(() => {
    if (allImages.length) {
      setImagesLoaded(new Array(allImages.length).fill(false));
    }
  }, [allImages.length]);
  
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
  
  // Fetch additional images from reviews if needed
  const { data: reviewImages, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviewImages', courseId],
    queryFn: async () => {
      // Only fetch review images if we have few or no images
      if (allImages.length >= 5) return [];
      
      const { data, error } = await supabase
        .from('course_reviews')
        .select('id, rating, image_url')
        .eq('course_id', courseId)
        .not('image_url', 'is', null)
        .order('rating', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error("Error fetching review images:", error);
        return [];
      }
      
      return data
        .map(review => review.image_url)
        .filter(Boolean) as string[];
    },
    enabled: allImages.length < 5 && !!courseId,
  });
  
  // Combine all images, removing duplicates
  const combinedImages = [...allImages];
  if (reviewImages && reviewImages.length > 0) {
    reviewImages.forEach(img => {
      if (!combinedImages.includes(img)) {
        combinedImages.push(img);
      }
    });
  }
  
  // Preload all images
  useEffect(() => {
    if (!combinedImages.length) return;
    
    combinedImages.forEach((src, index) => {
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
  }, [combinedImages]);
  
  if (combinedImages.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> 
            Fotos del Campo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No hay fotos disponibles para este campo
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" /> 
          Fotos del Campo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Carousel 
            className="w-full"
            opts={{
              loop: true,
              align: "start",
            }}
            setApi={setApi}
          >
            <CarouselContent>
              {combinedImages.map((imageUrl, index) => (
                <CarouselItem key={`photo-${index}`}>
                  <div className="relative h-52 md:h-80 w-full">
                    {/* Placeholder/loader while image loads */}
                    {!imagesLoaded[index] && (
                      <div className="absolute inset-0 bg-secondary/10 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    {/* The actual image with smooth transition */}
                    <img
                      src={imageUrl}
                      alt={`${courseName} - foto ${index + 1}`}
                      className={`w-full h-full object-cover rounded-sm transition-opacity duration-300 ${imagesLoaded[index] ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => {
                        setImagesLoaded(prev => {
                          const newState = [...prev];
                          newState[index] = true;
                          return newState;
                        });
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error+de+Imagen';
                        setImagesLoaded(prev => {
                          const newState = [...prev];
                          newState[index] = true;
                          return newState;
                        });
                      }}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {combinedImages.length > 1 && !isMobile && (
              <>
                <CarouselPrevious className="left-2" variant="outline" />
                <CarouselNext className="right-2" variant="outline" />
              </>
            )}
          </Carousel>

          {/* Dots for mobile navigation with minimalist design */}
          {combinedImages.length > 1 && isMobile && (
            <div className="flex justify-center gap-2 mt-4">
              {combinedImages.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  className="focus:outline-none"
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div 
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === current 
                        ? 'bg-primary scale-110' 
                        : 'bg-muted-foreground/30 scale-100'
                    }`} 
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CoursePhotos;
