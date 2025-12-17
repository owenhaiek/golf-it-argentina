import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminGolfCourseForm, GolfCourseTemplate } from "./AdminGolfCourseManager";
import AdminCourseList from "@/components/admin/CourseList";
import { motion } from "framer-motion";

const AdminCourseEditList = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourseTemplate | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEditCourse = (course: GolfCourseTemplate) => {
    setSelectedCourse(course);
    setShowAddForm(false);
  };

  const handleAddNewCourse = () => {
    setSelectedCourse(null);
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    setSelectedCourse(null);
    setShowAddForm(false);
    toast({
      title: "Éxito",
      description: selectedCourse ? "Campo de golf actualizado exitosamente" : "Campo de golf creado exitosamente",
    });
    window.location.reload();
  };

  const handleCancelEdit = () => {
    setSelectedCourse(null);
    setShowAddForm(false);
  };

  const isEditing = selectedCourse || showAddForm;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/10 via-zinc-950 to-zinc-950 fixed" />
      
      <div className="relative z-10 container mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => isEditing ? handleCancelEdit() : navigate('/admin')}
              className="flex items-center gap-2 bg-zinc-900/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              {isEditing ? "Volver a la Lista" : "Volver al Admin"}
            </Button>
            <h1 className="text-2xl font-bold text-white">
              {isEditing 
                ? (selectedCourse ? "Editar Campo de Golf" : "Agregar Nuevo Campo")
                : "Gestionar Campos de Golf"
              }
            </h1>
          </div>
          
          {!isEditing && (
            <Button
              onClick={handleAddNewCourse}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/30"
            >
              <Plus className="h-4 w-4" />
              Agregar Campo
            </Button>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isEditing ? (
            <AdminGolfCourseForm 
              initialCourse={selectedCourse || undefined} 
              onSubmitSuccess={handleFormSuccess}
            />
          ) : (
            <AdminCourseList onEditCourse={handleEditCourse} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCourseEditList;
