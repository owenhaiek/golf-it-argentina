
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CoursePhotosProps {
  courseId: string;
  courseName?: string; // Making it optional to fix the type error
  imageUrl?: string;
  imageGallery?: string[];
}

const CoursePhotos = ({ imageUrl, imageGallery = [] }: CoursePhotosProps) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine single image and gallery
  const allImages = [imageUrl, ...(imageGallery || [])].filter(Boolean) as string[];
  
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
            <Image className="h-10 w-10 mx-auto mb-2 opacity-30" />
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
          />
          
          {allImages.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8"
                onClick={handleNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentIndex ? 'bg-white' : 'bg-white/40'
                    }`}
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
