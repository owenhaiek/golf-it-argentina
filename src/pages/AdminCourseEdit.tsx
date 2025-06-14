import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AdminGolfCourseForm, GolfCourseTemplate } from "./AdminGolfCourseManager";
import { defaultOpeningHours, type OpeningHours } from "@/utils/openingHours";

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
        
        // Parse opening hours properly with type assertion
        let parsedOpeningHours: OpeningHours = defaultOpeningHours;
        
        if (data.opening_hours) {
          try {
            if (typeof data.opening_hours === 'string') {
              const parsed = JSON.parse(data.opening_hours);
              if (Array.isArray(parsed) && parsed.length === 7) {
                parsedOpeningHours = parsed as OpeningHours;
              }
            } else if (Array.isArray(data.opening_hours) && data.opening_hours.length === 7) {
              parsedOpeningHours = data.opening_hours as OpeningHours;
            }
          } catch (parseError) {
            console.error('Error parsing opening hours:', parseError);
            // Keep default opening hours if parsing fails
          }
        }
        
        // Transform the data to match GolfCourseTemplate
        const courseData: GolfCourseTemplate = {
          ...data,
          opening_hours: parsedOpeningHours,
          hole_pars: data.hole_pars || Array(data.holes || 18).fill(4),
          hole_handicaps: data.hole_handicaps || Array(data.holes || 18).fill(1)
        };
        
        console.log('Parsed course data with opening hours:', courseData);
        setCourse(courseData);
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
