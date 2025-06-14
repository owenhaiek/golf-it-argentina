
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import GalleryUploader from "@/components/admin/GalleryUploader";
import { defaultOpeningHours } from "@/utils/openingHours";

export interface GolfCourseTemplate {
  id?: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  holes: number;
  par?: number;
  image_url?: string;
  image_gallery?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: Array<{
    isOpen: boolean;
    open: string;
    close: string;
  }>;
  hole_pars?: number[];
  hole_handicaps?: number[];
}

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
  
  // Initialize opening hours properly
  const [openingHours, setOpeningHours] = useState<Array<{
    isOpen: boolean;
    open: string;
    close: string;
  }>>(
    initialCourse?.opening_hours || defaultOpeningHours
  );

  // Update opening hours when initialCourse changes
  useEffect(() => {
    if (initialCourse?.opening_hours) {
      console.log('Setting opening hours from initial course:', initialCourse.opening_hours);
      setOpeningHours(initialCourse.opening_hours);
    }
  }, [initialCourse]);

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
      latitude: undefined,
      longitude: undefined,
      hole_pars: Array(18).fill(4),
      hole_handicaps: Array(18).fill(1),
    },
  });

  const holes = watch("holes");
  const holePars = watch("hole_pars") || [];
  const holeHandicaps = watch("hole_handicaps") || [];

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
    console.log('Updated opening hours:', newOpeningHours);
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
      console.log('Submitting with opening hours:', openingHours);
      
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

  const daysOfWeek = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Campo*</Label>
              <Input
                id="name"
                {...register("name", { required: "El nombre es requerido" })}
                placeholder="Nombre del campo de golf"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Descripción del campo de golf"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="holes">Número de Hoyos*</Label>
                <Input
                  id="holes"
                  type="number"
                  {...register("holes", { 
                    required: "El número de hoyos es requerido",
                    valueAsNumber: true,
                    min: 1,
                    max: 36
                  })}
                  placeholder="18"
                />
                {errors.holes && (
                  <p className="text-sm text-red-500 mt-1">{errors.holes.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="par">Par Total</Label>
                <Input
                  id="par"
                  type="number"
                  {...register("par", { valueAsNumber: true, min: 27, max: 144 })}
                  placeholder="72"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Dirección completa del campo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Ciudad"
                />
              </div>

              <div>
                <Label htmlFor="state">Estado/Provincia</Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="Estado o provincia"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitud</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  {...register("latitude", { valueAsNumber: true })}
                  placeholder="-34.6118"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Coordenada de latitud (ejemplo: -34.6118)
                </p>
              </div>

              <div>
                <Label htmlFor="longitude">Longitud</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  {...register("longitude", { valueAsNumber: true })}
                  placeholder="-58.3816"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Coordenada de longitud (ejemplo: -58.3816)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://www.campo.com"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Imagen Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              onImageUploaded={(url) => setValue("image_url", url)}
              initialImage={watch("image_url")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Galería de Imágenes</CardTitle>
          </CardHeader>
          <CardContent>
            <GalleryUploader
              onGalleryUpdated={(urls) => setValue("image_gallery", urls)}
              initialGallery={watch("image_gallery")}
            />
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Horarios de Apertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {daysOfWeek.map((day, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-20 font-medium">{day}</div>
                  <Checkbox
                    checked={openingHours[index]?.isOpen || false}
                    onCheckedChange={(checked) => updateOpeningHours(index, "isOpen", checked)}
                  />
                  {openingHours[index]?.isOpen && (
                    <>
                      <Input
                        type="time"
                        value={openingHours[index]?.open || ""}
                        onChange={(e) => updateOpeningHours(index, "open", e.target.value)}
                        className="w-32"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={openingHours[index]?.close || ""}
                        onChange={(e) => updateOpeningHours(index, "close", e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hole Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Hoyos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: holes }, (_, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2">
                  <div className="font-medium text-center">Hoyo {i + 1}</div>
                  <div>
                    <Label className="text-xs">Par</Label>
                    <Input
                      type="number"
                      min="3"
                      max="6"
                      value={holePars[i] || 4}
                      onChange={(e) => updateHolePar(i, parseInt(e.target.value) || 4)}
                      className="text-center"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Handicap</Label>
                    <Input
                      type="number"
                      min="1"
                      value={holeHandicaps[i] || 1}
                      onChange={(e) => updateHoleHandicap(i, parseInt(e.target.value) || 1)}
                      className="text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
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
      </div>
    </form>
  );
};

const AdminGolfCourseManager = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gestor de Campos de Golf</h1>
        <p className="text-muted-foreground">
          Administra los campos de golf en tu sistema
        </p>
      </div>
      
      <AdminGolfCourseForm />
    </div>
  );
};

export default AdminGolfCourseManager;
