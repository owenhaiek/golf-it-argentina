import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GolfCourseTemplate {
  name: string;
  holes: number;
  par: number;
  address: string;
  state: string;
  opening_hours: any[];
}

const popularCourses: GolfCourseTemplate[] = [
  {
    name: "Olivos Golf Club",
    holes: 27,
    par: 72,
    address: "Ruta Panamericana Ramal Pilar, Km 40.5, Olivos",
    state: "Buenos Aires",
    opening_hours: [
      { isOpen: false, open: null, close: null }, // Monday - Closed
      { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Thursday
      { isOpen: true, open: "08:00", close: "18:00" }, // Friday
      { isOpen: true, open: "08:00", close: "18:00" }, // Saturday
      { isOpen: true, open: "08:00", close: "18:00" }  // Sunday
    ]
  },
  {
    name: "Buenos Aires Golf Club",
    holes: 27,
    par: 72,
    address: "Av. Campos Salles 1275, San Miguel",
    state: "Buenos Aires",
    opening_hours: [
      { isOpen: false, open: null, close: null }, // Monday - Closed
      { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Thursday
      { isOpen: true, open: "08:00", close: "18:00" }, // Friday
      { isOpen: true, open: "08:00", close: "18:00" }, // Saturday
      { isOpen: true, open: "08:00", close: "18:00" }  // Sunday
    ]
  },
  {
    name: "Jockey Club Argentino (Colorada Y Azul)",
    holes: 36,
    par: 72,
    address: "Av. Márquez 1702, San Isidro",
    state: "Buenos Aires",
    opening_hours: [
      { isOpen: false, open: null, close: null }, // Monday - Closed
      { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
      { isOpen: false, open: null, close: null }, // Thursday - Closed
      { isOpen: false, open: null, close: null }, // Friday - Closed
      { isOpen: false, open: null, close: null }, // Saturday - Closed
      { isOpen: false, open: null, close: null }  // Sunday - Closed
    ]
  }
];

interface QuickAddGolfCoursesProps {
  onCourseSelected?: (course: GolfCourseTemplate) => void;
}

const QuickAddGolfCourses = ({ onCourseSelected }: QuickAddGolfCoursesProps) => {
  const [addingCourse, setAddingCourse] = useState("");
  const { toast } = useToast();

  const handleAddCourse = async (course: GolfCourseTemplate) => {
    if (onCourseSelected) {
      // If there's a callback, use it instead of adding directly
      onCourseSelected(course);
      return;
    }

    setAddingCourse(course.name);
    try {
      // Check if course already exists
      const { data: existing } = await supabase
        .from("golf_courses")
        .select("id")
        .eq("name", course.name)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Campo ya existe",
          description: `${course.name} ya existe en la base de datos`,
          variant: "default",
        });
        return;
      }

      // Add the course directly
      const { error } = await supabase
        .from("golf_courses")
        .insert({
          ...course,
          hole_pars: Array(course.holes).fill(4), // Default par 4 for each hole
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Se ha agregado ${course.name}`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error adding course:", error);
      toast({
        title: "Error",
        description: `No se pudo agregar el campo: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setAddingCourse("");
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Campos de golf populares</h2>
      <p className="mb-4 text-muted-foreground">
        Selecciona un campo de golf para cargarlo rápidamente o agregarlo directamente:
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden sm:table-cell">Hoyos</TableHead>
            <TableHead className="hidden sm:table-cell">Par</TableHead>
            <TableHead className="hidden md:table-cell">Dirección</TableHead>
            <TableHead>Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {popularCourses.map((course) => (
            <TableRow key={course.name}>
              <TableCell className="font-medium">{course.name}</TableCell>
              <TableCell className="hidden sm:table-cell">{course.holes}</TableCell>
              <TableCell className="hidden sm:table-cell">{course.par}</TableCell>
              <TableCell className="hidden md:table-cell">{course.address}</TableCell>
              <TableCell>
                {onCourseSelected ? (
                  <Button onClick={() => onCourseSelected(course)}>
                    Seleccionar
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleAddCourse(course)}
                    disabled={Boolean(addingCourse)}
                    variant="outline"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {addingCourse === course.name ? "Agregando..." : "Agregar"}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default QuickAddGolfCourses;
