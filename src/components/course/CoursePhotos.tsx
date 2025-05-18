
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
import { useIsMobile } from "@/hooks/use-mobile";

interface CoursePhotosProps {
  courseId?: string;
}

export const CoursePhotos = ({ courseId }: CoursePhotosProps) => {
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
    allImages.push(course.image_url);
  }
  
  // Add gallery images if they exist
  if (course?.image_gallery) {
    const galleryImages = course.image_gallery
      .split(',')
      .map(url => url.trim())
      .filter(url => url !== '');
      
    allImages.push(...galleryImages);
  }

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
        <Carousel className="w-full">
          <CarouselContent>
            {allImages.map((imageUrl, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <div className="overflow-hidden rounded-lg">
                    <img 
                      src={imageUrl} 
                      alt={`Course photo ${index + 1}`} 
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
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
      </CardContent>
    </Card>
  );
};

export default CoursePhotos;
