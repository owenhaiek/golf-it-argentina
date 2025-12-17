import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

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
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <img 
              src={preview} 
              alt="Preview" 
              className="h-48 w-full object-cover rounded-lg border border-zinc-700/50" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error+al+cargar+imagen';
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <button
                type="button"
                onClick={clearImage}
                className="bg-red-500/90 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                title="Eliminar imagen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border-2 border-dashed border-zinc-700/50 rounded-lg p-8 flex flex-col items-center justify-center text-zinc-400 cursor-pointer hover:border-green-500/50 hover:bg-zinc-800/30 transition-all duration-300"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-green-500" />
            </div>
            <p className="mb-2 text-center font-medium">Toca para subir una imagen</p>
            <span className="text-xs text-zinc-500 text-center">JPG, PNG, GIF hasta 5MB</span>
          </motion.div>
        )}
      </AnimatePresence>
      
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
          variant="outline"
          disabled={uploading}
          className={`w-full cursor-pointer ${
            preview 
              ? "bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white" 
              : "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
          }`}
          asChild
        >
          <span>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : preview ? (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Cambiar imagen
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Seleccionar imagen
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default ImageUploader;
