
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { GolfCourseTemplate } from "@/pages/AdminGolfCourseManager";
import { BasicInfoCard } from "./BasicInfoCard";
import { LocationCard } from "./LocationCard";
import { ContactCard } from "./ContactCard";
import { ImagesCard } from "./ImagesCard";
import { OpeningHoursCard } from "./OpeningHoursCard";
import { HoleConfigurationCard } from "./HoleConfigurationCard";
import { ImagePreviewCard } from "./ImagePreviewCard";

interface AdminGolfCourseFormProps {
  initialCourse?: GolfCourseTemplate;
  onSubmitSuccess?: () => void;
}

export const AdminGolfCourseForm: React.FC<AdminGolfCourseFormProps> = ({
  initialCourse,
  onSubmitSuccess,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openingHours, setOpeningHours] = useState<Array<{
    isOpen: boolean;
    open: string;
    close: string;
  }>>(
    initialCourse?.opening_hours || 
    Array(7).fill({ isOpen: false, open: "", close: "" })
  );

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GolfCourseTemplate>({
    defaultValues: initialCourse || {
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      phone: "",
      website: "",
      holes: 18,
      par: 72,
      image_url: "",
      image_gallery: "",
      established_year: new Date().getFullYear(),
      type: "Standard",
      latitude: undefined,
      longitude: undefined,
      hole_pars: Array(18).fill(4),
      hole_handicaps: Array(18).fill(1),
    },
  });

  const holes = watch("holes");
  const holePars = watch("hole_pars") || [];
  const holeHandicaps = watch("hole_handicaps") || [];
  const imageUrl = watch("image_url");
  const imageGallery = watch("image_gallery");

  useEffect(() => {
    if (holes !== holePars.length) {
      const newHolePars = Array(holes).fill(4);
      const newHoleHandicaps = Array(holes).fill(1);
      
      for (let i = 0; i < Math.min(holes, holePars.length); i++) {
        newHolePars[i] = holePars[i] || 4;
      }
      
      for (let i = 0; i < Math.min(holes, holeHandicaps.length); i++) {
        newHoleHandicaps[i] = holeHandicaps[i] || 1;
      }
      
      setValue("hole_pars", newHolePars);
      setValue("hole_handicaps", newHoleHandicaps);
    }
  }, [holes, holePars.length, holeHandicaps.length, setValue]);

  const updateOpeningHours = (dayIndex: number, field: string, value: any) => {
    const newOpeningHours = [...openingHours];
    newOpeningHours[dayIndex] = { ...newOpeningHours[dayIndex], [field]: value };
    setOpeningHours(newOpeningHours);
  };

  const updateHolePar = (holeIndex: number, par: number) => {
    const newHolePars = [...holePars];
    newHolePars[holeIndex] = par;
    setValue("hole_pars", newHolePars);
  };

  const updateHoleHandicap = (holeIndex: number, handicap: number) => {
    const newHoleHandicaps = [...holeHandicaps];
    newHoleHandicaps[holeIndex] = handicap;
    setValue("hole_handicaps", newHoleHandicaps);
  };

  const onSubmit = async (data: GolfCourseTemplate) => {
    setIsSubmitting(true);
    try {
      const courseData = {
        ...data,
        opening_hours: JSON.stringify(openingHours),
        latitude: data.latitude ? parseFloat(data.latitude.toString()) : null,
        longitude: data.longitude ? parseFloat(data.longitude.toString()) : null,
      };

      let result;
      if (initialCourse?.id) {
        result = await supabase
          .from("golf_courses")
          .update(courseData)
          .eq("id", initialCourse.id);
      } else {
        result = await supabase
          .from("golf_courses")
          .insert([courseData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Éxito",
        description: initialCourse?.id 
          ? "Campo de golf actualizado exitosamente" 
          : "Campo de golf creado exitosamente",
      });
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: `Error al guardar el campo: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Form */}
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <BasicInfoCard register={register} errors={errors} />
          <LocationCard register={register} />
          <ContactCard register={register} />
          <ImagesCard register={register} />
          <OpeningHoursCard 
            openingHours={openingHours} 
            updateOpeningHours={updateOpeningHours} 
          />
          <HoleConfigurationCard
            holes={holes}
            holePars={holePars}
            holeHandicaps={holeHandicaps}
            updateHolePar={updateHolePar}
            updateHoleHandicap={updateHoleHandicap}
          />

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>Guardar Campo</>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Column - Image Preview */}
      <div className="space-y-6">
        <ImagePreviewCard imageUrl={imageUrl} imageGallery={imageGallery} />
      </div>
    </div>
  );
};
