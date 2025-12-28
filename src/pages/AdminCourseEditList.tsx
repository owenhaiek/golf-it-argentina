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
          className="mb-6 space-y-4"
        >
          {/* Mobile: Stack vertically */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => isEditing ? handleCancelEdit() : navigate('/admin')}
                className="shrink-0 bg-zinc-900/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl h-10 w-10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {isEditing 
                  ? (selectedCourse ? "Editar Campo" : "Nuevo Campo")
                  : "Gestionar Campos"
                }
              </h1>
            </div>
            
            {!isEditing && (
              <Button
                onClick={handleAddNewCourse}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/30 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Agregar Campo
              </Button>
            )}
          </div>
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
