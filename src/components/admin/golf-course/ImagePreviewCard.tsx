
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ImagePreviewCardProps {
  imageUrl?: string;
  imageGallery?: string;
}

export const ImagePreviewCard: React.FC<ImagePreviewCardProps> = ({
  imageUrl,
  imageGallery,
}) => {
  const getGalleryImages = () => {
    if (!imageGallery) return [];
    return imageGallery.split(',').map(url => url.trim()).filter(Boolean);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista Previa de Imágenes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Image Preview */}
        {imageUrl && (
          <div>
            <Label className="text-sm font-medium">Imagen Principal</Label>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="Imagen principal del campo"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Gallery Images Preview */}
        {imageGallery && getGalleryImages().length > 0 && (
          <div>
            <Label className="text-sm font-medium">Galería de Imágenes</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {getGalleryImages().map((url, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`Imagen de galería ${index + 1}`}
                    className="w-full h-24 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {!imageUrl && !imageGallery && (
          <div className="text-center text-muted-foreground py-8">
            <p>Las imágenes aparecerán aquí cuando agregues URLs válidas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
