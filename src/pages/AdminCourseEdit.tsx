
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AdminGolfCourseForm, GolfCourseTemplate } from "./AdminGolfCourseManager";

const AdminCourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<GolfCourseTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('golf_courses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Parse opening_hours if it's a string
        let parsedOpeningHours = data.opening_hours;
        if (typeof data.opening_hours === 'string') {
          try {
            parsedOpeningHours = JSON.parse(data.opening_hours);
          } catch (e) {
            console.error('Error parsing opening hours:', e);
            parsedOpeningHours = [
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
          ...data,
          opening_hours: parsedOpeningHours
        } as GolfCourseTemplate);
      } catch (error) {
        console.error('Error fetching course:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el campo de golf",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id, toast]);

  const handleSubmitSuccess = () => {
    toast({
      title: "Éxito",
      description: "Campo de golf actualizado exitosamente",
    });
    navigate('/admin');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Campo de golf no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Editar Campo de Golf</h1>
        </div>
        
        <AdminGolfCourseForm 
          initialCourse={course} 
          onSubmitSuccess={handleSubmitSuccess}
        />
      </div>
    </div>
  );
};

export default AdminCourseEdit;
