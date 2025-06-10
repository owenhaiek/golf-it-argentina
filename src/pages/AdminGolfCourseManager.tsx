import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { Plus, ArrowLeft } from "lucide-react";
import CourseList from "@/components/admin/CourseList";
import { useNavigate } from "react-router-dom";

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
  hole_distances?: number[];
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
    hole_distances: Array(18).fill(400),
    hole_handicaps: Array(18).fill(0).map((_, i) => i + 1),
  });

  const { toast } = useToast();

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
      
      setCourse({
        ...initialCourse,
        opening_hours: openingHours || [
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" },
          { isOpen: true, open: "08:00", close: "18:00" }
        ],
        hole_pars: initialCourse.hole_pars || Array(initialCourse.holes || 18).fill(4),
        hole_distances: initialCourse.hole_distances || Array(initialCourse.holes || 18).fill(400),
        hole_handicaps: initialCourse.hole_handicaps || Array(initialCourse.holes || 18).fill(0).map((_, i) => i + 1),
      });
    }
  }, [initialCourse]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof GolfCourseTemplate) => {
    setCourse({ ...course, [field]: e.target.value });
  };

  const handleHolesChange = (value: string) => {
    const newHoles = parseInt(value);
    setCourse({
      ...course,
      holes: newHoles,
      hole_pars: Array(newHoles).fill(4),
      hole_distances: Array(newHoles).fill(400),
      hole_handicaps: Array(newHoles).fill(0).map((_, i) => i + 1),
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
    setCourse({ ...course, hole_pars: newHolePars });
  };

  const handleHoleDistanceChange = (holeIndex: number, distance: string) => {
    const newDistances = [...(course.hole_distances || [])];
    newDistances[holeIndex] = parseInt(distance) || 0;
    setCourse({ ...course, hole_distances: newDistances });
  };

  const handleHoleHandicapChange = (holeIndex: number, handicap: string) => {
    const newHandicaps = [...(course.hole_handicaps || [])];
    newHandicaps[holeIndex] = parseInt(handicap) || 1;
    setCourse({ ...course, hole_handicaps: newHandicaps });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const courseData = {
        ...course,
        opening_hours: JSON.stringify(course.opening_hours),
        hole_distances: course.hole_distances,
        hole_handicaps: course.hole_handicaps,
      };

      if (initialCourse?.id) {
        const { error } = await supabase
          .from('golf_courses')
          .update(courseData)
          .eq('id', initialCourse.id);

        if (error) throw error;
        toast({
          title: "Éxito",
          description: "Campo de golf actualizado exitosamente",
        });
      } else {
        const { error } = await supabase
          .from('golf_courses')
          .insert([courseData]);

        if (error) throw error;
        toast({
          title: "Éxito",
          description: "Campo de golf creado exitosamente",
        });
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Error al guardar el campo de golf",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Campo de Golf</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                type="text"
                id="name"
                value={course.name}
                onChange={(e) => handleInputChange(e, 'name')}
                required
              />
            </div>
            <div>
              <Label htmlFor="holes">Número de Hoyos</Label>
              <Select onValueChange={handleHolesChange} value={course.holes.toString()}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el número de hoyos" />
                </SelectTrigger>
                <SelectContent>
                  {[9, 18].map((num) => (
                    <SelectItem key={num} value={num.toString()}>{num} Hoyos</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="par">Par</Label>
              <Input
                type="number"
                id="par"
                value={course.par}
                onChange={(e) => handleInputChange(e, 'par')}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                type="tel"
                id="phone"
                value={course.phone || ""}
                onChange={(e) => handleInputChange(e, 'phone')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                type="url"
                id="website"
                value={course.website || ""}
                onChange={(e) => handleInputChange(e, 'website')}
              />
            </div>
            <div>
              <Label htmlFor="image_url">URL de la Imagen</Label>
              <Input
                type="url"
                id="image_url"
                value={course.image_url || ""}
                onChange={(e) => handleInputChange(e, 'image_url')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image_gallery">URL de la Galería de Imágenes (separadas por comas)</Label>
            <Input
              type="text"
              id="image_gallery"
              value={course.image_gallery || ""}
              onChange={(e) => handleInputChange(e, 'image_gallery')}
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={course.description || ""}
              onChange={(e) => handleInputChange(e, 'description')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Ubicación</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                type="text"
                id="address"
                value={course.address || ""}
                onChange={(e) => handleInputChange(e, 'address')}
              />
            </div>
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
          <CardTitle>Horarios de Apertura</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Label className="w-24">{['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][i]}</Label>
              <Checkbox
                id={`isOpen-${i}`}
                checked={course.opening_hours?.[i]?.isOpen || false}
                onCheckedChange={(checked) => handleOpeningHoursChange(i, 'isOpen', checked!)}
              />
              <Label htmlFor={`isOpen-${i}`} className="ml-2">Abierto</Label>
              <Input
                type="time"
                value={course.opening_hours?.[i]?.open || "08:00"}
                onChange={(e) => handleOpeningHoursChange(i, 'open', e.target.value)}
                disabled={!course.opening_hours?.[i]?.isOpen}
                className="ml-4"
              />
              <Input
                type="time"
                value={course.opening_hours?.[i]?.close || "18:00"}
                onChange={(e) => handleOpeningHoursChange(i, 'close', e.target.value)}
                disabled={!course.opening_hours?.[i]?.isOpen}
                className="ml-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de Hoyos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: course.holes }, (_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Hoyo {i + 1}</h4>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Par</label>
                  <input
                    type="number"
                    min="3"
                    max="5"
                    value={course.hole_pars?.[i] || 4}
                    onChange={(e) => handleHoleParChange(i, e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Distancia (yds)</label>
                  <input
                    type="number"
                    min="50"
                    max="800"
                    value={course.hole_distances?.[i] || 400}
                    onChange={(e) => handleHoleDistanceChange(i, e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Handicap</label>
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={course.hole_handicaps?.[i] || (i + 1)}
                    onChange={(e) => handleHoleHandicapChange(i, e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button disabled={isLoading} className="w-full">
        {isLoading ? "Guardando..." : "Guardar Campo de Golf"}
      </Button>
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
