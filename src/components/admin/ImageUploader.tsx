
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  initialImage?: string;
  bucketName?: string;
}

const ImageUploader = ({
  onImageUploaded,
  initialImage,
  bucketName = "golf_course_images"
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      
      // Generate a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Set the preview and call the onImageUploaded callback
      const publicUrl = publicUrlData.publicUrl;
      setPreview(publicUrl);
      onImageUploaded(publicUrl);
      
      toast({
        title: "Imagen subida exitosamente",
        description: "La imagen ha sido cargada correctamente.",
      });
      
    } catch (error: any) {
      toast({
        title: "Error al subir la imagen",
        description: error.message || "Ocurrió un error al subir la imagen",
        variant: "destructive",
      });
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    uploadImage(file);
  };

  const clearImage = () => {
    setPreview(null);
    onImageUploaded("");
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="h-40 w-full object-cover rounded-md" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error+al+cargar+imagen';
            }}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            title="Eliminar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-gray-500"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <Upload className="h-8 w-8 mb-2" />
          <p className="mb-2 text-center">Toca para subir una imagen</p>
          <span className="text-xs text-center">JPG, PNG, GIF hasta 5MB</span>
        </div>
      )}
      
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      
      <label htmlFor="image-upload">
        <Button
          type="button"
          variant={preview ? "outline" : "default"}
          disabled={uploading}
          className="w-full cursor-pointer"
          asChild
        >
          <span>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : preview ? (
              "Cambiar imagen"
            ) : (
              "Seleccionar imagen"
            )}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default ImageUploader;
