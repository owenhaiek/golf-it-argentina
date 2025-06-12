
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { GalleryHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface CoursePhotosProps {
  courseId: string;
  courseName?: string;
  imageUrl?: string;
  imageGallery?: string[] | string;
}

const CoursePhotos = ({ imageUrl, imageGallery = [] }: CoursePhotosProps) => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Parse the gallery if it's a string
  const parseGallery = (): string[] => {
    if (!imageGallery) return [];
    
    if (typeof imageGallery === 'string') {
      return imageGallery.split(',').map(url => url.trim()).filter(url => url !== '');
    }
    
    if (Array.isArray(imageGallery)) {
      return imageGallery;
    }
    
    return [];
  };
  
  // Combine single image and gallery
  const parsedGallery = parseGallery();
  const allImages = [imageUrl, ...parsedGallery].filter(Boolean) as string[];

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allImages.map((image, index) => (
          <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div 
                className="relative w-full aspect-video overflow-hidden bg-muted"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image}
                  alt={`Course photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full-width image modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-screen-lg w-full h-[90vh] p-0">
          <div className="relative w-full h-full bg-black">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Course photo full view"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoursePhotos;
