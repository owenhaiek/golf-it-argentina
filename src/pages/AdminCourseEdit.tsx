
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
            let openingHoursData: any;
            
            if (typeof data.opening_hours === 'string') {
              openingHoursData = JSON.parse(data.opening_hours);
            } else {
              openingHoursData = data.opening_hours;
            }
            
            // Validate that it's an array with 7 elements and each has the correct structure
            if (Array.isArray(openingHoursData) && openingHoursData.length === 7) {
              const isValidOpeningHours = openingHoursData.every(day => 
                typeof day === 'object' && 
                day !== null &&
                'isOpen' in day &&
                'open' in day &&
                'close' in day
              );
              
              if (isValidOpeningHours) {
                parsedOpeningHours = openingHoursData as OpeningHours;
                console.log('Successfully parsed opening hours:', parsedOpeningHours);
              } else {
                console.warn('Opening hours data structure is invalid, using defaults');
              }
            } else {
              console.warn('Opening hours is not a valid 7-day array, using defaults');
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
        
        console.log('Final course data with parsed opening hours:', courseData);
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
