import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { GolfCourseTemplate } from "@/pages/AdminGolfCourseManager";
import { OpeningHours, supabase } from "@/lib/supabase";
import { defaultOpeningHours } from "@/utils/openingHours";
import ImageUploader from "@/components/admin/ImageUploader";
import GalleryUploader from "@/components/admin/GalleryUploader";

interface AdminGolfCourseFormProps {
  initialCourse?: GolfCourseTemplate | null;
  onSubmitSuccess?: () => void;
}

interface FormData {
  name: string;
  holes: number;
  par: number;
  address: string;
  city: string;
  state: string;
  description: string;
  phone: string;
  website: string;
  image_url: string;
  image_gallery: string;
  opening_hours: OpeningHours;
  hole_pars: number[];
}

const AdminGolfCourseForm = ({ initialCourse, onSubmitSuccess }: AdminGolfCourseFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: "",
      holes: 18,
      par: 72,
      address: "",
      city: "",
      state: "",
      description: "",
      phone: "",
      website: "",
      image_url: "",
      image_gallery: "",
      opening_hours: defaultOpeningHours,
      hole_pars: Array(18).fill(4),
    },
  });

  // Initialize form with existing golf course data if available
  useEffect(() => {
    if (initialCourse) {
      console.log('Loading initial course data:', initialCourse);
      
      // Set basic fields
      setValue("name", initialCourse.name || "");
      setValue("holes", initialCourse.holes || 18);
      setValue("par", initialCourse.par || 72);
      setValue("address", initialCourse.address || "");
      setValue("city", initialCourse.city || "");
      setValue("state", initialCourse.state || "");
      setValue("phone", initialCourse.phone || "");
      setValue("website", initialCourse.website || "");
      setValue("description", initialCourse.description || "");
      setValue("image_url", initialCourse.image_url || "");
      setValue("image_gallery", initialCourse.image_gallery || "");
      
      // Set opening hours if available, otherwise set defaults
      if (typeof initialCourse.opening_hours === 'string') {
        try {
          const parsedHours = JSON.parse(initialCourse.opening_hours);
          setValue("opening_hours", parsedHours);
        } catch (e) {
          console.error('Error parsing opening hours:', e);
          setValue("opening_hours", defaultOpeningHours);
        }
      } else if (Array.isArray(initialCourse.opening_hours)) {
        setValue("opening_hours", initialCourse.opening_hours);
      } else if (initialCourse.opening_hours && typeof initialCourse.opening_hours === 'object') {
        setValue("opening_hours", initialCourse.opening_hours);
      } else {
        setValue("opening_hours", defaultOpeningHours);
      }
      
      // Set hole pars - this is crucial for the bug fix
      if (initialCourse.hole_pars && Array.isArray(initialCourse.hole_pars) && initialCourse.hole_pars.length > 0) {
        console.log('Setting hole pars from initial course:', initialCourse.hole_pars);
        setValue("hole_pars", initialCourse.hole_pars);
      } else {
        // If no hole pars are set, create default array based on course holes
        const defaultPars = Array(initialCourse.holes || 18).fill(4);
        console.log('Setting default hole pars:', defaultPars);
        setValue("hole_pars", defaultPars);
      }
    } else {
      // Reset form for new course
      setValue("hole_pars", Array(18).fill(4));
    }
  }, [initialCourse, setValue]);

  const watchedHoles = watch("holes");
  const watchedHolePars = watch("hole_pars");

  // Update hole pars array when number of holes changes
  useEffect(() => {
    const currentHolePars = watchedHolePars || [];
    const newHolePars = Array(watchedHoles).fill(0).map((_, index) => 
      currentHolePars[index] || 4
    );
    setValue("hole_pars", newHolePars);
  }, [watchedHoles, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formattedOpeningHours = JSON.stringify(data.opening_hours);
      
      const courseData = {
        name: data.name,
        holes: data.holes,
        par: data.par,
        address: data.address,
        city: data.city,
        state: data.state,
        description: data.description,
        phone: data.phone,
        website: data.website,
        image_url: data.image_url,
        image_gallery: data.image_gallery,
        opening_hours: formattedOpeningHours,
        hole_pars: data.hole_pars,
      };
      
      let result;
      
      if (initialCourse?.id) {
        // Update existing course
        result = await supabase
          .from("golf_courses")
          .update(courseData)
          .eq("id", initialCourse.id);
      } else {
        // Create new course
        result = await supabase
          .from("golf_courses")
          .insert([courseData]);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: initialCourse ? "Campo de golf actualizado" : "Campo de golf creado",
        description: `El campo ${data.name} ha sido ${initialCourse ? "actualizado" : "creado"} exitosamente.`,
      });
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        // Reset form if no callback provided
        reset();
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: `Error al ${initialCourse ? "actualizar" : "crear"} el campo de golf: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to handle opening hours changes
  const handleOpeningHoursChange = (dayIndex: number, field: string, value: any) => {
    const currentHours = watch("opening_hours");
    const updatedHours = [...currentHours];
    
    // If toggling isOpen, reset open/close times when closing
    if (field === "isOpen" && value === false) {
      updatedHours[dayIndex] = { isOpen: false, open: null, close: null };
    } else {
      updatedHours[dayIndex] = {
        ...updatedHours[dayIndex],
        [field]: value
      };
    }
    
    setValue("opening_hours", updatedHours);
  };

  // Function to handle hole par changes
  const handleHoleParChange = (holeIndex: number, par: number) => {
    const currentHolePars = watch("hole_pars") || [];
    const updatedHolePars = [...currentHolePars];
    updatedHolePars[holeIndex] = par;
    setValue("hole_pars", updatedHolePars);
    
    // Update total par
    const totalPar = updatedHolePars.reduce((sum, holePar) => sum + holePar, 0);
    setValue("par", totalPar);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const openingHours = watch("opening_hours");
  
  // Handler for image uploads
  const handleMainImageUploaded = (url: string) => {
    setValue("image_url", url);
  };
  
  // Handler for gallery uploads
  const handleGalleryUpdated = (galleryUrlsString: string) => {
    setValue("image_gallery", galleryUrlsString);
  };

  // Debug current values
  console.log('Current form values:', {
    hole_pars: watchedHolePars,
    holes: watchedHoles,
    image_url: watch("image_url"),
    image_gallery: watch("image_gallery")
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Card className="mx-auto max-w-6xl">
        <div className="p-6 border-b bg-white">
          <h2 className="text-2xl font-bold">
            {initialCourse ? "Editar Campo de Golf" : "Agregar Nuevo Campo de Golf"}
          </h2>
          <p className="text-muted-foreground">
            {initialCourse
              ? "Actualiza la información del campo de golf"
              : "Ingresa la información del nuevo campo de golf"}
          </p>
        </div>
        
        <div className="p-6 bg-white max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info Section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-semibold mb-2">Información Básica</legend>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">
                    Nombre *
                  </label>
                  <input
                    id="name"
                    className="w-full p-2 border rounded-md"
                    {...register("name", { required: "Este campo es obligatorio" })}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="holes">
                      Hoyos *
                    </label>
                    <input
                      id="holes"
                      type="number"
                      min="1"
                      max="36"
                      className="w-full p-2 border rounded-md"
                      {...register("holes", {
                        required: "Este campo es obligatorio",
                        valueAsNumber: true,
                        min: { value: 1, message: "Mínimo 1 hoyo" },
                        max: { value: 36, message: "Máximo 36 hoyos" }
                      })}
                    />
                    {errors.holes && (
                      <p className="text-red-500 text-sm mt-1">{errors.holes.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="par">
                      Par Total
                    </label>
                    <input
                      id="par"
                      type="number"
                      className="w-full p-2 border rounded-md bg-gray-100"
                      {...register("par", {
                        valueAsNumber: true,
                      })}
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Se calcula automáticamente</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="description">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    className="w-full p-2 border rounded-md h-32"
                    {...register("description")}
                  />
                </div>
              </fieldset>
              
              {/* Location Section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-semibold mb-2">Ubicación</legend>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="address">
                    Dirección
                  </label>
                  <input
                    id="address"
                    className="w-full p-2 border rounded-md"
                    {...register("address")}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="city">
                      Ciudad
                    </label>
                    <input
                      id="city"
                      className="w-full p-2 border rounded-md"
                      {...register("city")}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="state">
                      Estado
                    </label>
                    <input
                      id="state"
                      className="w-full p-2 border rounded-md"
                      {...register("state")}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
            
            <hr className="my-6" />
            
            {/* Par por Hoyo Section */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold mb-4">Par por Hoyo</legend>
              <p className="text-sm text-gray-600 mb-4">
                Configura el par para cada hoyo del campo de golf
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-3">
                {Array.from({ length: watchedHoles }, (_, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <label className="text-xs font-medium mb-1">
                      Hoyo {index + 1}
                    </label>
                    <select
                      value={watchedHolePars?.[index] || 4}
                      onChange={(e) => handleHoleParChange(index, parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md text-center"
                    >
                      <option value={3}>Par 3</option>
                      <option value={4}>Par 4</option>
                      <option value={5}>Par 5</option>
                    </select>
                  </div>
                ))}
              </div>
            </fieldset>
            
            <hr className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-semibold mb-2">Información de Contacto</legend>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="phone">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    className="w-full p-2 border rounded-md"
                    {...register("phone")}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="website">
                    Sitio Web
                  </label>
                  <input
                    id="website"
                    className="w-full p-2 border rounded-md"
                    {...register("website")}
                  />
                </div>
              </fieldset>
              
              {/* Media Section */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-semibold mb-2">Multimedia</legend>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Imagen Principal
                  </label>
                  <ImageUploader 
                    onImageUploaded={handleMainImageUploaded}
                    initialImage={watch("image_url")}
                  />
                  <input
                    type="hidden"
                    {...register("image_url")}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Galería de Imágenes
                  </label>
                  <GalleryUploader
                    onGalleryUpdated={handleGalleryUpdated}
                    initialGallery={watch("image_gallery")}
                  />
                  <input
                    type="hidden"
                    {...register("image_gallery")}
                  />
                </div>
              </fieldset>
            </div>
            
            <hr className="my-6" />
            
            {/* Opening Hours Section */}
            <fieldset>
              <legend className="text-lg font-semibold mb-4">Horarios de Apertura</legend>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {days.map((day, index) => (
                  <div key={day} className="border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{day}</span>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`isOpen-${index}`}
                          checked={openingHours[index]?.isOpen || false}
                          onChange={(e) => handleOpeningHoursChange(index, "isOpen", e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor={`isOpen-${index}`} className="text-sm">
                          Abierto
                        </label>
                      </div>
                    </div>
                    
                    {openingHours[index]?.isOpen && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs mb-1" htmlFor={`open-${index}`}>
                            Apertura
                          </label>
                          <input
                            type="time"
                            id={`open-${index}`}
                            value={openingHours[index]?.open || ""}
                            onChange={(e) => handleOpeningHoursChange(index, "open", e.target.value)}
                            className="w-full p-1 border rounded-md text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs mb-1" htmlFor={`close-${index}`}>
                            Cierre
                          </label>
                          <input
                            type="time"
                            id={`close-${index}`}
                            value={openingHours[index]?.close || ""}
                            onChange={(e) => handleOpeningHoursChange(index, "close", e.target.value)}
                            className="w-full p-1 border rounded-md text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
            
            <div className="flex justify-end gap-4 pt-6 border-t bg-white sticky bottom-0">
              <button
                type="button"
                onClick={() => {
                  if (onSubmitSuccess) onSubmitSuccess();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                {initialCourse ? "Actualizar Campo" : "Crear Campo"}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AdminGolfCourseForm;
