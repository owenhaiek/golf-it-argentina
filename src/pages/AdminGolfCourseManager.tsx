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
import { Loader2, MapPin, Phone, Globe, Clock, Flag, Image, Info, Save } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import GalleryUploader from "@/components/admin/GalleryUploader";
import { defaultOpeningHours, type OpeningHours } from "@/utils/openingHours";
import { validateOpeningHours, prepareOpeningHoursForSave } from "@/utils/openingHoursValidation";
import { motion } from "framer-motion";

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
  opening_hours?: OpeningHours;
  hole_pars?: number[];
  hole_handicaps?: number[];
}

interface AdminGolfCourseFormProps {
  initialCourse?: GolfCourseTemplate;
  onSubmitSuccess?: () => void;
}

const inputStyles = "bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-green-500/50 focus:ring-green-500/20";
const labelStyles = "text-zinc-300 font-medium";

export const AdminGolfCourseForm: React.FC<AdminGolfCourseFormProps> = ({
  initialCourse,
  onSubmitSuccess,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const getInitialOpeningHours = (): OpeningHours => {
    if (initialCourse?.opening_hours) {
      return validateOpeningHours(initialCourse.opening_hours);
    }
    return defaultOpeningHours;
  };

  const [openingHours, setOpeningHours] = useState<OpeningHours>(getInitialOpeningHours());

  useEffect(() => {
    if (initialCourse?.opening_hours) {
      const validatedHours = validateOpeningHours(initialCourse.opening_hours);
      setOpeningHours(validatedHours);
    }
  }, [initialCourse?.opening_hours]);

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
    
    if (field === 'isOpen') {
      newOpeningHours[dayIndex] = { 
        ...newOpeningHours[dayIndex], 
        [field]: value,
        open: value ? (newOpeningHours[dayIndex].open || defaultOpeningHours[dayIndex].open) : null,
        close: value ? (newOpeningHours[dayIndex].close || defaultOpeningHours[dayIndex].close) : null
      };
    } else {
      newOpeningHours[dayIndex] = { ...newOpeningHours[dayIndex], [field]: value };
    }
    
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
        opening_hours: prepareOpeningHoursForSave(openingHours),
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <motion.div variants={itemVariants}>
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-green-500" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="name" className={labelStyles}>Nombre del Campo*</Label>
                  <Input
                    id="name"
                    {...register("name", { required: "El nombre es requerido" })}
                    placeholder="Nombre del campo de golf"
                    className={inputStyles}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className={labelStyles}>Descripción</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Descripción del campo de golf"
                    rows={3}
                    className={`${inputStyles} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="holes" className={labelStyles}>Número de Hoyos*</Label>
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
                      className={inputStyles}
                    />
                    {errors.holes && (
                      <p className="text-sm text-red-400 mt-1">{errors.holes.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="par" className={labelStyles}>Par Total</Label>
                    <Input
                      id="par"
                      type="number"
                      {...register("par", { valueAsNumber: true, min: 27, max: 144 })}
                      placeholder="72"
                      className={inputStyles}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location */}
          <motion.div variants={itemVariants}>
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="address" className={labelStyles}>Dirección</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Dirección completa del campo"
                    className={inputStyles}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className={labelStyles}>Ciudad</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="Ciudad"
                      className={inputStyles}
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className={labelStyles}>Estado/Provincia</Label>
                    <Input
                      id="state"
                      {...register("state")}
                      placeholder="Estado o provincia"
                      className={inputStyles}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude" className={labelStyles}>Latitud</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      {...register("latitude", { valueAsNumber: true })}
                      placeholder="-34.6118"
                      className={inputStyles}
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Coordenada de latitud (ejemplo: -34.6118)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="longitude" className={labelStyles}>Longitud</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      {...register("longitude", { valueAsNumber: true })}
                      placeholder="-58.3816"
                      className={inputStyles}
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Coordenada de longitud (ejemplo: -58.3816)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-500" />
                  Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="phone" className={labelStyles}>Teléfono</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+54 11 1234-5678"
                    className={inputStyles}
                  />
                </div>

                <div>
                  <Label htmlFor="website" className={labelStyles}>Sitio Web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="website"
                      {...register("website")}
                      placeholder="https://www.campo.com"
                      className={`${inputStyles} pl-10`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Images */}
          <motion.div variants={itemVariants}>
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Image className="h-5 w-5 text-green-500" />
                  Imagen Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ImageUploader
                  onImageUploaded={(url) => setValue("image_url", url)}
                  initialImage={watch("image_url")}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Image className="h-5 w-5 text-green-500" />
                  Galería de Imágenes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <GalleryUploader
                  onGalleryUpdated={(urls) => setValue("image_gallery", urls)}
                  initialGallery={watch("image_gallery")}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Opening Hours */}
          <motion.div variants={itemVariants}>
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Horarios de Apertura
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {daysOfWeek.map((day, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/30"
                    >
                      <div className="w-24 font-medium text-zinc-300 text-sm">{day}</div>
                      <Checkbox
                        checked={openingHours[index]?.isOpen || false}
                        onCheckedChange={(checked) => updateOpeningHours(index, "isOpen", checked)}
                        className="border-zinc-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      {openingHours[index]?.isOpen && (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={openingHours[index]?.open || ""}
                            onChange={(e) => updateOpeningHours(index, "open", e.target.value)}
                            className={`${inputStyles} w-28 text-sm`}
                          />
                          <span className="text-zinc-500">-</span>
                          <Input
                            type="time"
                            value={openingHours[index]?.close || ""}
                            onChange={(e) => updateOpeningHours(index, "close", e.target.value)}
                            className={`${inputStyles} w-28 text-sm`}
                          />
                        </div>
                      )}
                      {!openingHours[index]?.isOpen && (
                        <span className="text-zinc-500 text-sm">Cerrado</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hole Configuration */}
          <motion.div variants={itemVariants}>
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Flag className="h-5 w-5 text-green-500" />
                  Configuración de Hoyos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: holes }, (_, i) => (
                    <motion.div 
                      key={i} 
                      className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/30 space-y-2"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <div className="font-medium text-center text-green-400 text-sm">
                        Hoyo {i + 1}
                      </div>
                      <div>
                        <Label className="text-xs text-zinc-400">Par</Label>
                        <Input
                          type="number"
                          min="3"
                          max="6"
                          value={holePars[i] || 4}
                          onChange={(e) => updateHolePar(i, parseInt(e.target.value) || 4)}
                          className={`${inputStyles} text-center text-sm h-8`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-zinc-400">Handicap</Label>
                        <Input
                          type="number"
                          min="1"
                          value={holeHandicaps[i] || 1}
                          onChange={(e) => updateHoleHandicap(i, parseInt(e.target.value) || 1)}
                          className={`${inputStyles} text-center text-sm h-8`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Submit Button - Full Width */}
      <motion.div 
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-medium py-6 text-lg shadow-lg shadow-green-500/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              {initialCourse?.id ? "Actualizar Campo" : "Crear Campo de Golf"}
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
};

const AdminGolfCourseManager = () => {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Flag className="h-8 w-8 text-green-500" />
            Gestor de Campos de Golf
          </h1>
          <p className="text-zinc-400 mt-2">
            Crea y administra los campos de golf en tu sistema
          </p>
        </motion.div>
        
        <AdminGolfCourseForm />
      </div>
    </div>
  );
};

export default AdminGolfCourseManager;
