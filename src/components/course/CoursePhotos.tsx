import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, CircleDot, Circle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import type { Api as CarouselApi } from "embla-carousel";

interface CoursePhotosProps {
  courseId?: string;
}

export const CoursePhotos = ({ courseId }: CoursePhotosProps) => {
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  
  const { data: course } = useQuery({
    queryKey: ['course-photos', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from('golf_courses')
        .select('image_url, image_gallery')
        .eq('id', courseId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });

  const isMobile = useIsMobile();

  // Extract all image URLs from both the main image and the gallery
  const allImages = [];
  
  // Add main image if it exists
  if (course?.image_url) {
    allImages.push(course?.image_url);
  }
  
  // Add gallery images if they exist
  if (course?.image_gallery) {
    const galleryImages = course.image_gallery
      .split(',')
      .map(url => url.trim())
      .filter(url => url !== '');
      
    allImages.push(...galleryImages);
  }

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
  
  // Initialize loaded state for images
  useEffect(() => {
    if (allImages.length) {
      setImagesLoaded(new Array(allImages.length).fill(false));
    }
  }, [allImages.length]);

  // If there are no images, show the placeholder
  if (allImages.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Photos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
          <p>No photos available</p>
        </CardContent>
      </Card>
    );
  }

  const showControls = allImages.length > 1 && !isMobile;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Photos</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="w-full relative">
          <Carousel className="w-full" opts={{
            loop: true,
            align: "start",
          }} setApi={setApi}>
            <CarouselContent>
              {allImages.map((imageUrl, index) => (
                <CarouselItem key={index} className="basis-full md:basis-full">
                  <div className="p-1">
                    <div className="overflow-hidden rounded-lg relative h-64">
                      {/* Loader placeholder */}
                      {!imagesLoaded[index] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-secondary/10">
                          <div className="w-8 h-8 border-2 border-primary/30 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img 
                        src={imageUrl} 
                        alt={`Course photo ${index + 1}`} 
                        className={`w-full h-full object-cover transition-opacity duration-300 ${imagesLoaded[index] ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => {
                          setImagesLoaded(prev => {
                            const newState = [...prev];
                            newState[index] = true;
                            return newState;
                          });
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                          setImagesLoaded(prev => {
                            const newState = [...prev];
                            newState[index] = true;
                            return newState;
                          });
                        }}
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {showControls && (
              <>
                <CarouselPrevious 
                  className="left-2 lg:left-4"
                  variant="outline"
                />
                <CarouselNext 
                  className="right-2 lg:right-4"
                  variant="outline"
                />
              </>
            )}
          </Carousel>

          {/* Dots for mobile navigation */}
          {allImages.length > 1 && isMobile && (
            <div className="flex justify-center gap-1 mt-2">
              {allImages.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  className="focus:outline-none"
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {index === current ? 
                    <CircleDot className="h-4 w-4 text-primary" /> : 
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  }
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
