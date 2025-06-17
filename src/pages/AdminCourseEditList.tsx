
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminGolfCourseForm, GolfCourseTemplate } from "./AdminGolfCourseManager";
import AdminCourseList from "@/components/admin/CourseList";

const AdminCourseEditList = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourseTemplate | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEditCourse = (course: GolfCourseTemplate) => {
    console.log("Editing course:", course);
    setSelectedCourse(course);
    setShowAddForm(false);
  };

  const handleAddNewCourse = () => {
    console.log("Adding new course");
    setSelectedCourse(null);
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    console.log("Form submitted successfully");
    setSelectedCourse(null);
    setShowAddForm(false);
    toast({
      title: "Éxito",
      description: selectedCourse ? "Campo de golf actualizado exitosamente" : "Campo de golf creado exitosamente",
    });
    // Force refresh of the course list by reloading the component
    window.location.reload();
  };

  const handleCancelEdit = () => {
    console.log("Cancelling edit");
    setSelectedCourse(null);
    setShowAddForm(false);
  };

  const isEditing = selectedCourse || showAddForm;

  console.log("AdminCourseEditList render - isEditing:", isEditing, "selectedCourse:", selectedCourse, "showAddForm:", showAddForm);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Admin
            </Button>
            <h1 className="text-2xl font-bold">
              {isEditing 
                ? (selectedCourse ? "Editar Campo de Golf" : "Agregar Nuevo Campo")
                : "Gestionar Campos de Golf"
              }
            </h1>
          </div>
          
          {!isEditing && (
            <Button
              onClick={handleAddNewCourse}
              className="flex items-center gap-2"
            >
              Agregar Campo
            </Button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a la Lista
              </Button>
            </div>
            
            <AdminGolfCourseForm 
              initialCourse={selectedCourse || undefined} 
              onSubmitSuccess={handleFormSuccess}
            />
          </div>
        ) : (
          <AdminCourseList onEditCourse={handleEditCourse} />
        )}
      </div>
    </div>
  );
};

export default AdminCourseEditList;
