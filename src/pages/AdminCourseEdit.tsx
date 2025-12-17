import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AdminGolfCourseForm, GolfCourseTemplate } from "./AdminGolfCourseManager";
import { validateOpeningHours } from "@/utils/openingHoursValidation";
import { motion } from "framer-motion";

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
        
        const validatedOpeningHours = validateOpeningHours(data.opening_hours);
        
        const courseData: GolfCourseTemplate = {
          ...data,
          opening_hours: validatedOpeningHours,
          hole_pars: data.hole_pars || Array(data.holes || 18).fill(4),
          hole_handicaps: data.hole_handicaps || Array(data.holes || 18).fill(1)
        };
        
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-400">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950" />
        <div className="relative z-10 text-zinc-400">Campo de golf no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/10 via-zinc-950 to-zinc-950 fixed" />
      
      <div className="relative z-10 container mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 bg-zinc-900/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-white">Editar Campo de Golf</h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdminGolfCourseForm 
            initialCourse={course} 
            onSubmitSuccess={handleSubmitSuccess}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCourseEdit;
