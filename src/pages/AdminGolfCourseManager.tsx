
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminGolfCourseForm from "./AdminCsvUpload"; // Maintained for form functionality 
import QuickAddGolfCourses from "@/components/admin/QuickAddGolfCourses";
import CourseList from "@/components/admin/CourseList";

interface GolfCourseTemplate {
  id?: string;
  name: string;
  holes: number;
  par: number;
  address: string;
  state: string;
  opening_hours: any[];
}

const AdminGolfCourseManager = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [courseToEdit, setCourseToEdit] = useState<GolfCourseTemplate | null>(null);

  const handleEditCourse = (course: GolfCourseTemplate) => {
    setCourseToEdit(course);
    setActiveTab("form");
  };

  const handleFormSubmitted = () => {
    setCourseToEdit(null);
    setActiveTab("list");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Panel de Administración de Campos de Golf</h1>
        <p className="text-muted-foreground">
          Administra la información de los campos de golf en el sistema.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista de Campos</TabsTrigger>
          <TabsTrigger value="form">
            {courseToEdit ? "Editar Campo" : "Formulario Completo"}
          </TabsTrigger>
          <TabsTrigger value="quick">Adición Rápida</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <CourseList onEditCourse={handleEditCourse} />
        </TabsContent>
        
        <TabsContent value="form" className="mt-4">
          <AdminGolfCourseForm 
            initialCourse={courseToEdit} 
            onSubmitSuccess={handleFormSubmitted} 
          />
        </TabsContent>
        
        <TabsContent value="quick" className="mt-4">
          <QuickAddGolfCourses />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGolfCourseManager;
