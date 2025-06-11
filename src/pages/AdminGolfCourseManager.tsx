import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ArrowLeft } from "lucide-react";
import CourseList from "@/components/admin/CourseList";
import { useNavigate } from "react-router-dom";
import ImageUploader from "@/components/admin/ImageUploader";
import GalleryUploader from "@/components/admin/GalleryUploader";

export interface GolfCourseTemplate {
  id?: string;
  name: string;
  holes: number;
  par: number;
  address?: string;
  state?: string;
  city?: string;
  description?: string;
  phone?: string;
  website?: string;
  image_url?: string;
  image_gallery?: string;
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

export const AdminGolfCourseForm = ({ initialCourse, onSubmitSuccess }: AdminGolfCourseFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourse] = useState<GolfCourseTemplate>({
    name: "",
    holes: 18,
    par: 72,
    address: "",
    state: "",
    city: "",
    description: "",
    phone: "",
    website: "",
    image_url: "",
    image_gallery: "",
    opening_hours: [
      { isOpen: true, open: "08:00", close: "18:00" },
      { isOpen: true, open: "08:00", close: "18:00" },
      { isOpen: true, open: "08:00", close: "18:00" },
      { isOpen: true, open: "08:00", close: "18:00" },
      { isOpen: true, open: "08:00", close: "18:00" },
      { isOpen: true, open: "08:00", close: "18:00" },
      { isOpen: true, open: "08:00", close: "18:00" }
    ],
    hole_pars: Array(18).fill(4),
    hole_handicaps: Array(18).fill(0),
  });

  const { toast } = useToast();

  // Calculate total par from hole pars
  const calculateTotalPar = (holePars: number[]) => {
    return holePars.reduce((total, par) => total + (par || 4), 0);
  };

  useEffect(() => {
    if (initialCourse) {
      console.log('Initial course data:', initialCourse);
      
      let openingHours = initialCourse.opening_hours;
      if (typeof openingHours === 'string') {
        try {
          openingHours = JSON.parse(openingHours);
        } catch (e) {
          console.error('Error parsing opening hours:', e);
          openingHours = [
            { isOpen: true, open: "08:00", close: "18:00" },
            { isOpen: true, open: "08:00", close: "18:00" },
            { isOpen: true, open: "08:00", close: "18:00" },
            { isOpen: true, open: "08:00", close: "18:00" },
            { isOpen: true, open: "08:00", close: "18:00" },
            { isOpen: true, open: "08:00", close: "18:00" },
            { isOpen: true, open: "08:00", close: "18:00" }
          ];
        }
      }
      
      const holePars = initialCourse.hole_pars || Array(initialCourse.holes || 18).fill(4);
      const calculatedPar = calculateTotalPar(holePars);
      
      setCourse({
        ...initialCourse,
        par: calculatedPar,
        opening_hours: openingHours || [
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" }
        ],
        hole_pars: holePars,
        hole_handicaps: initialCourse.hole_handicaps || Array(initialCourse.holes || 18).fill(0),
      });
    }
  }, [initialCourse]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof GolfCourseTemplate) => {
    setCourse({ ...course, [field]: e.target.value });
  };

  const handleHolesChange = (value: string) => {
    const newHoles = parseInt(value);
    if (isNaN(newHoles) || newHoles <= 0) return;
    
    const newHolePars = Array(newHoles).fill(4);
    const newPar = calculateTotalPar(newHolePars);
    
    setCourse({
      ...course,
      holes: newHoles,
      par: newPar,
      hole_pars: newHolePars,
      hole_handicaps: Array(newHoles).fill(0),
    });
  };

  const handleOpeningHoursChange = (dayIndex: number, field: string, value: string | boolean) => {
    const newOpeningHours = [...(course.opening_hours || [])];
    if (typeof value === 'boolean') {
      newOpeningHours[dayIndex].isOpen = value;
    } else {
      (newOpeningHours[dayIndex] as any)[field] = value;
    }
    setCourse({ ...course, opening_hours: newOpeningHours });
  };

  const handleHoleParChange = (holeIndex: number, par: string) => {
    const newHolePars = [...(course.hole_pars || [])];
    newHolePars[holeIndex] = parseInt(par) || 4;
    
    const newPar = calculateTotalPar(newHolePars);
    
    setCourse({ 
      ...course, 
      hole_pars: newHolePars,
      par: newPar
    });
  };

  const handleHoleHandicapChange = (holeIndex: number, handicap: string) => {
    const newHandicaps = [...(course.hole_handicaps || [])];
    newHandicaps[holeIndex] = parseInt(handicap) || 0;
    setCourse({ ...course, hole_handicaps: newHandicaps });
  };

  const handleImageUploaded = (url: string) => {
    setCourse({ ...course, image_url: url });
  };

  const handleGalleryUpdated = (urls: string) => {
    setCourse({ ...course, image_gallery: urls });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const courseData = {
        name: course.name.trim(),
        holes: course.holes,
        par: course.par,
        address: course.address?.trim() || null,
        state: course.state?.trim() || null,
        city: course.city?.trim() || null,
        description: course.description?.trim() || null,
        phone: course.phone?.trim() || null,
        website: course.website?.trim() || null,
        image_url: course.image_url?.trim() || null,
        image_gallery: course.image_gallery?.trim() || null,
        opening_hours: course.opening_hours ? JSON.stringify(course.opening_hours) : null,
        hole_pars: course.hole_pars || null,
        hole_handicaps: course.hole_handicaps || null,
      };

      console.log('Saving course data:', courseData);

      if (initialCourse?.id) {
        const { error } = await supabase
          .from('golf_courses')
          .update(courseData)
          .eq('id', initialCourse.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        toast({
          title: "Éxito",
          description: "Campo de golf actualizado exitosamente",
        });
      } else {
        const { error } = await supabase
          .from('golf_courses')
          .insert([courseData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        toast({
          title: "Éxito",
          description: "Campo de golf creado exitosamente",
        });
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: `Error al guardar el campo de golf: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Campo</Label>
                <Input
                  type="text"
                  id="name"
                  value={course.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="holes">Número de Hoyos</Label>
                  <Select onValueChange={handleHolesChange} value={course.holes.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el número de hoyos" />
                    </SelectTrigger>
                    <SelectContent>
                      {[9, 18].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} Hoyos</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="par">Par (Calculado automáticamente)</Label>
                  <Input
                    type="number"
                    id="par"
                    value={course.par}
                    readOnly
                    className="bg-gray-100"
                    title="El par se calcula automáticamente sumando los pares de cada hoyo"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={course.description || ""}
                  onChange={(e) => handleInputChange(e, 'description')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  type="text"
                  id="address"
                  value={course.address || ""}
                  onChange={(e) => handleInputChange(e, 'address')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    type="text"
                    id="city"
                    value={course.city || ""}
                    onChange={(e) => handleInputChange(e, 'city')}
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    type="text"
                    id="state"
                    value={course.state || ""}
                    onChange={(e) => handleInputChange(e, 'state')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  type="tel"
                  id="phone"
                  value={course.phone || ""}
                  onChange={(e) => handleInputChange(e, 'phone')}
                />
              </div>
              <div>
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  type="url"
                  id="website"
                  value={course.website || ""}
                  onChange={(e) => handleInputChange(e, 'website')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Imagen Principal</Label>
                <ImageUploader
                  onImageUploaded={handleImageUploaded}
                  initialImage={course.image_url}
                />
              </div>
              <div>
                <Label>Galería de Imágenes</Label>
                <GalleryUploader
                  onGalleryUpdated={handleGalleryUpdated}
                  initialGallery={course.image_gallery}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Apertura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-20 text-sm">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][i]}
                  </div>
                  <Checkbox
                    id={`isOpen-${i}`}
                    checked={course.opening_hours?.[i]?.isOpen || false}
                    onCheckedChange={(checked) => handleOpeningHoursChange(i, 'isOpen', checked!)}
                  />
                  <Input
                    type="time"
                    value={course.opening_hours?.[i]?.open || "08:00"}
                    onChange={(e) => handleOpeningHoursChange(i, 'open', e.target.value)}
                    disabled={!course.opening_hours?.[i]?.isOpen}
                    className="w-24"
                  />
                  <span className="text-sm">a</span>
                  <Input
                    type="time"
                    value={course.opening_hours?.[i]?.close || "18:00"}
                    onChange={(e) => handleOpeningHoursChange(i, 'close', e.target.value)}
                    disabled={!course.opening_hours?.[i]?.isOpen}
                    className="w-24"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de los Hoyos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                {Array.from({ length: course.holes }, (_, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-2">
                    <h4 className="font-medium text-sm">Hoyo {i + 1}</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Par</label>
                        <input
                          type="number"
                          min="3"
                          max="5"
                          value={course.hole_pars?.[i] || 4}
                          onChange={(e) => handleHoleParChange(i, e.target.value)}
                          className="w-full p-1 border rounded text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1">Handicap</label>
                        <input
                          type="number"
                          min="0"
                          max="18"
                          value={course.hole_handicaps?.[i] || 0}
                          onChange={(e) => handleHoleHandicapChange(i, e.target.value)}
                          className="w-full p-1 border rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="col-span-full">
        <Button disabled={isLoading} className="w-full">
          {isLoading ? "Guardando..." : "Guardar Campo de Golf"}
        </Button>
      </div>
    </form>
  );
};

const AdminGolfCourseManager = () => {
  const [currentView, setCurrentView] = useState<'list' | 'add'>('list');
  const navigate = useNavigate();

  const handleEditCourse = (course: GolfCourseTemplate) => {
    navigate(`/admin/course-edit/${course.id}`);
  };

  const handleAddCourseSuccess = () => {
    setCurrentView('list');
  };

  if (currentView === 'add') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('list')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la Lista
            </Button>
            <h1 className="text-2xl font-bold">Agregar Nuevo Campo de Golf</h1>
          </div>
          
          <AdminGolfCourseForm onSubmitSuccess={handleAddCourseSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Administrar Campos de Golf</h1>
          <Button
            onClick={() => setCurrentView('add')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Campo
          </Button>
        </div>
        
        <CourseList onEditCourse={handleEditCourse} />
      </div>
    </div>
  );
};

export default AdminGolfCourseManager;

}
