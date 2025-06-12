
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X, GalleryHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GalleryUploaderProps {
  onGalleryUpdated: (urls: string) => void;
  initialGallery?: string;
  bucketName?: string;
}

const GalleryUploader = ({
  onGalleryUpdated,
  initialGallery = "",
  bucketName = "golf_course_images"
}: GalleryUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  // Parse initial gallery URLs
  const initialUrls = initialGallery 
    ? initialGallery.split(',').map(url => url.trim()).filter(url => url !== '')
    : [];
  
  const [galleryImages, setGalleryImages] = useState<string[]>(initialUrls);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Update gallery state
      const publicUrl = publicUrlData.publicUrl;
      const updatedGallery = [...galleryImages, publicUrl];
      setGalleryImages(updatedGallery);
      
      // Update parent component with comma-separated URLs
      onGalleryUpdated(updatedGallery.join(','));
      
      toast({
        title: "Imagen subida exitosamente",
        description: "La imagen ha sido agregada a la galería.",
      });
      
    } catch (error: any) {
      toast({
        title: "Error al subir la imagen",
        description: error.message || "Ocurrió un error al subir la imagen",
        variant: "destructive",
      });
      console.error("Error uploading gallery image:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedGallery = [...galleryImages];
    updatedGallery.splice(index, 1);
    setGalleryImages(updatedGallery);
    onGalleryUpdated(updatedGallery.join(','));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    uploadImage(file);
  };

  return (
    <div className="space-y-4">
      {galleryImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {galleryImages.map((imageUrl, index) => (
            <div key={index} className="relative">
              <img
                src={imageUrl}
                alt={`Gallery image ${index + 1}`}
                className="h-24 w-full object-cover rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error';
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                title="Eliminar imagen"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center text-gray-500 cursor-pointer"
        onClick={() => document.getElementById('gallery-upload')?.click()}
      >
        <GalleryHorizontal className="h-6 w-6 mb-2" />
        <p className="text-sm text-center">Toca para agregar imágenes a la galería</p>
      </div>
      
      <input
        type="file"
        id="gallery-upload"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
};

export default GalleryUploader;
