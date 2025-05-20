
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight, Image, GalleryHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CoursePhotosProps {
  courseId: string;
  courseName?: string;
  imageUrl?: string;
  imageGallery?: string[] | string;
}

const CoursePhotos = ({ imageUrl, imageGallery = [] }: CoursePhotosProps) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Parse the gallery if it's a string
  const parseGallery = () => {
    if (!imageGallery) return [];
    
    if (typeof imageGallery === 'string') {
      try {
        return imageGallery.split(',').map(url => url.trim()).filter(url => url !== '');
      } catch (error) {
        console.error("Error parsing gallery:", error);
        return [];
      }
    }
    
    return imageGallery;
  };
  
  // Combine single image and gallery
  const parsedGallery = parseGallery();
  const allImages = [imageUrl, ...parsedGallery].filter(Boolean) as string[];
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  if (allImages.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 flex justify-center items-center min-h-[200px] bg-muted/20">
          <div className="text-center text-muted-foreground">
            <GalleryHorizontal className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>{t("course", "noPhotos")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative">
        <div className="relative w-full aspect-video overflow-hidden bg-muted">
          <img
            src={allImages[currentIndex]}
            alt="Course photo"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
            }}
          />
          
          {allImages.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8 z-10"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8 z-10"
                onClick={handleNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentIndex ? "bg-white scale-125" : "bg-white/40"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CoursePhotos;
